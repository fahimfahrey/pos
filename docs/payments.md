# Payment System Architecture

This document describes the payment gateway adapter architecture, mirroring the storage-swappability pattern already established in the codebase.

## Overview

The payment system uses a minimal `PaymentGateway` port interface that allows swapping payment providers without modifying checkout or refund code. This is identical to how the `StorageDriver` pattern works: define a port, implement concrete adapters, register them via a factory pattern, and the rest of the domain code uses dependency injection to call `resolvePaymentGateway(name)`.

## Gateway Table

| Gateway | Shipped | Location | Sync | Notes |
|---------|---------|----------|------|-------|
| `cash` | ✓ | `src/infrastructure/payments/adapters/cash/` | Sync | Handles tendered amount, change calculation, drawer-kick events |
| `store-credit` | ✓ | `src/infrastructure/payments/adapters/store-credit/` | Sync | Debits/credits customer ledger; ledger-backed via `StoreCreditService` |
| `fake` | ✓ (test-only) | `src/infrastructure/payments/adapters/fake/` | Async simulation | Contract test double; never auto-registered in production |
| `stripe` | ⧖ | N/A | Async | Designed; not implemented. Would implement `PaymentGateway` interface. |
| `bkash` | ⧖ | N/A | Async | Designed; not implemented. |
| `sslcommerz` | ⧖ | N/A | Async | Designed; not implemented. |

## Adding a New Gateway

1. **Create the adapter** at `src/infrastructure/payments/adapters/<name>/gateway.ts`
   - Implement `PaymentGateway` interface with `charge()` and `refund()` methods
   - Implement `readonly id: string` and `readonly requiresServer: boolean` properties
   - Return appropriate status values from `PAYMENT_STATUS` and `REFUND_STATUS` enums

2. **Register the gateway** in `src/infrastructure/payments/adapters/<name>/index.ts`
   ```ts
   import { registerPaymentGateway } from '../../gateway-registry'
   import { StripeGateway } from './gateway'
   
   registerPaymentGateway('stripe', () => new StripeGateway())
   ```

3. **Auto-import** in `src/infrastructure/payments/index.ts`
   ```ts
   import './adapters/stripe'  // Add this line
   ```

4. **Run the conformance suite**
   ```bash
   npm run test
   ```
   The `payment-gateway-conformance.ts` suite tests contract compliance. Your gateway must pass the same tests `CashGateway` passes.

5. **No other changes needed**
   - `FinalizeSaleService` requires no edits
   - `RefundService` requires no edits
   - UI code remains unchanged (callers already supply `gateway` id per split)

## What Activates When a Server Deployment Exists

This payment system is currently a client-side implementation. When adding a real network gateway (Stripe, bKash, SSLCommerz), several pieces become active:

### 1. Webhook Signature Verification
A new route `src/app/api/payments/webhooks/[gateway]/route.ts` (not created by this card) would:
- Extract the gateway name from the URL
- Verify the webhook signature header using gateway-specific credentials (secret key, etc.)
- Reject unverified webhooks with 401/403 before touching any business logic
- Pass verified events to the gateway event store

**Credentials**: Gateway API keys are server-only environment variables. Adapter instances must only be constructed in `'use server'` actions or backend infrastructure, never in client-renderable components.

### 2. Idempotent Event Store
`GatewayEventStore` (port defined in `src/domains/payments/ports/gateway-event-store.ts`, not implemented):
- Prevents webhook event replay/double-processing
- Must track `(gateway, externalEventId)` pairs
- Called by webhook handler to check `hasProcessed()` before processing a new event
- Called to `markProcessed()` after successfully applying the event

**Why interface-only?** An unused collection with no writer is dead weight in Dexie schema migrations; every future schema version replays the entire migration chain on existing browsers. Once a server deployment exists and webhooks are live, implementers add the collection and implement this port.

### 3. Async Status Reconciliation
Payment status transitions are already designed for this:
- `PaymentService.recordStatusTransition()` supports moving `PENDING → CAPTURED / FAILED` later
- A webhook handler is the only new caller needed; no service changes required
- Example flow:
  1. Charge call returns `PENDING` (network gateway's response is delayed)
  2. Checkout saves payment with `status: PENDING`
  3. Later, webhook arrives with `charge.succeeded`
  4. Webhook handler calls `paymentService.recordStatusTransition(payment.id, CAPTURED, { actorId: 'webhook' })`

### 4. Authorization and Permissions
- Refunds remain ADMIN+-gated at the action layer (`create-refund.ts` calls `requireAdminMembership`)
- No changes to permission checks needed when adding online gateways
- Webhook handlers should be protected by signature verification + idempotent store; UI authorization (role checks) remains in `create-refund.ts`

## Separation: Sync vs. Async Gateways

**Cash & Store Credit (Sync, Local)**
- Charge/refund complete immediately within the transaction
- `PaymentGatewayContext.repos` is the open transaction's repository set
- Both are called inside `provider.withTransaction`, so failure rolls back atomically

**Network Gateways (Async, Server-Required)**
- Charge/refund involve network I/O (HTTP calls to Stripe, etc.)
- Holding a driver transaction open across a network call is an anti-pattern
- Solution (designed but not implemented): split into authorize → capture cycle
  - `authorize()` call (if supported) inside the transaction; record PENDING status
  - External webhook later brings the confirmed status back via the event store
  - `recordStatusTransition()` updates it to CAPTURED/FAILED based on webhook event

**Current Implementation**: Only sync gateways are shipped. A future Stripe implementation must solve the "transaction-spanning-network-call" problem, likely via the authorize/capture pattern or a post-sale callback.

## Status Transition Graph

Payments follow a strict state machine to prevent nonsensical transitions (e.g., `REFUNDED → CAPTURED` is illegal):

```
┌─ Initial Creation (null) can go to:
│  - PENDING: waiting for async confirmation
│  - AUTHORIZED: pre-authorized (awaiting capture)
│  - CAPTURED: completed immediately
│  - FAILED: declined upfront
│
├─ PENDING → {AUTHORIZED, CAPTURED, FAILED}
├─ AUTHORIZED → {CAPTURED, FAILED, VOIDED}
├─ CAPTURED → {PARTIALLY_REFUNDED, REFUNDED, VOIDED}
├─ PARTIALLY_REFUNDED → {REFUNDED}
│
└─ FAILED, REFUNDED, VOIDED are terminal
```

Every transition is logged in `PaymentStatusEvent`, the append-only ledger. This guards against webhook replays; if a second `charge.succeeded` webhook arrives, `recordStatusTransition` rejects it as invalid (already `CAPTURED`).

## Idempotency

### Charges
- `PaymentService.chargeSplitPayments()` checks `findPaymentById(request.id)` before calling the gateway
- If the payment already exists, it's returned unchanged without re-charging
- `request.id` is the idempotency key (defaults to same as `idempotencyKey` field)

### Refunds
- `RefundService.refund()` receives a `Refund.id` from the caller
- No deduplication happens in the service itself; it's the caller's responsibility
- `create-refund.ts` action uses the same ULID generation, so a retried action will use the same refund id
- The gateway receives `idempotencyKey: refund.id` and must handle replays

### Gateway-Level Idempotency
- `CashGateway` and `StoreCreditGateway` ignore the idempotency key (local, synchronous operations)
- `FakeGateway` stores idempotency maps and returns the same result for duplicate keys
- Real network gateways (Stripe, bKash) must implement idempotency on their end; we send the key, they guarantee single-execution

## Refunds: Stock Reversal in One UnitOfWork

When a refund specifies `refundedItems`, stock is reversed atomically:

```ts
const refund = await refundService.refund(repos, {
  paymentId: payment.id,
  items: [{ variantId: '...', quantity: 2 }],
  initiatedBy: userId,
  // ...
})
// Inside refundService.refund:
// 1. Call gateway.refund() → get RefundResult
// 2. Save Refund row
// 3. For each item: call inventory.recordReturn() → creates StockMovement, updates StockLevel
// 4. Update Payment.status to PARTIALLY_REFUNDED or REFUNDED
// All in the same repos transaction
```

If any step fails, the entire transaction rolls back: no Refund, no StockMovement, no Payment status change. The caller (action layer) wraps this in `provider.withTransaction()`.

## Store Credit

Store credit is a payment method with its own ledger:

- `StoreCreditTransaction` rows track all debits (redemptions) and credits (issuances, refunds)
- `Customer.storeCreditBalance` is the materialized current value
- `StoreCreditService` enforces the invariant: balance never goes negative (throws `InsufficientStoreCreditError`)
- When store credit is used as payment: `StoreCreditGateway.charge()` calls `StoreCreditService.redeem()` inside the transaction
- On refund: `StoreCreditGateway.refund()` calls `StoreCreditService.issue()` to re-credit the customer

---

**Last Updated**: 2026-07-19  
**Schema Version**: 7 (with `paymentStatusEvents` and `storeCreditTransactions` collections)  
**Gateways Shipped**: cash, store-credit  
**Gateways Pending**: stripe, bkash, sslcommerz (interface-only, awaiting server deployment + webhook receiver)
