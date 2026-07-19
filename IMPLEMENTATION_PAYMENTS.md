# Payment System Implementation Summary

**Card**: `plan-card_1784266069993_10_tw01`  
**Status**: Core infrastructure complete; integration & tests pending  
**Schema Version**: Bumped to 7 (paymentStatusEvents + storeCreditTransactions collections added)

## Completed

### 1. Enums & Constants ✓
- `src/constants/enums/payment-status.ts` — `PAYMENT_STATUS` numeric enum (PENDING=1 through VOIDED=7)
- `src/constants/enums/refund-status.ts` — `REFUND_STATUS` numeric enum (PENDING=1, COMPLETED=2, FAILED=3)
- Updated `src/constants/enums/payment-method.ts` — added `STORE_CREDIT: 'store_credit'`
- Updated `src/constants/enums/registry.ts` — registered payment/refund status in `ENUM_REGISTRY_KEY` and `STATIC_ENUM_VALUES`
- `src/constants/maps/payment-status-labels.ts`, `refund-status-labels.ts` — human-readable labels
- Updated `src/constants/maps/payment-method-labels.ts` — added Store Credit label
- Updated re-exports in `src/constants/enums/index.ts` and `maps/index.ts`

### 2. Entities ✓
- **Payments domain**:
  - Rewrote `src/domains/payments/entities/payment.ts` with new fields: `gateway`, `gatewayRef`, `idempotencyKey`, `tendered`, `changeDue`, `customerId`, `status` (now `PaymentStatus` enum)
  - Updated `Refund` interface with `saleId`, `initiatedBy`, `refundedItems[]`, `status` (now `RefundStatus` enum)
  - Added `RefundedItem` interface for stock reversal references
  - Created `src/domains/payments/entities/payment-status-event.ts` — append-only ledger for all status transitions

- **Customers domain**:
  - Updated `src/domains/customers/entities/customer.ts` — added `storeCreditBalance: number`
  - Created `src/domains/customers/entities/store-credit-transaction.ts` — ledger for store credit debits/credits

### 3. Ports & Interfaces ✓
- `src/domains/payments/ports/payment-gateway.ts` — `PaymentGateway` interface with `charge()`, `refund()` methods and context injection
- `src/domains/payments/ports/gateway-event-store.ts` — `GatewayEventStore` (interface-only, no implementation; designed for future webhook idempotency)
- Updated `src/domains/payments/repository.ts` with new methods: `findRefundById`, `listRefundsForSale`, `appendStatusEvent`, `listStatusEvents`
- Updated `src/domains/customers/repository.ts` with new methods: `saveStoreCreditTransaction`, `listStoreCreditTransactions`

### 4. Domain Events & Errors ✓
- `src/domains/payments/events.ts` — `PaymentEvent` type (payment.captured, payment.failed, payment.refunded, drawer.kick)
- `src/domains/payments/errors.ts` — `GatewayNotRegisteredError`, `InvalidPaymentStatusTransitionError`, `RefundExceedsPaymentError`, `SplitPaymentTotalMismatchError`
- `src/domains/customers/errors.ts` — `InsufficientStoreCreditError`

### 5. Pure Libraries ✓
- `src/domains/payments/lib/split-payment.ts` — `sumPaymentAmounts()`, `assertSplitPaymentsCoverTotal()` with integer-cent-safe math
- `src/domains/payments/services/payment-status-machine.ts` — `isValidPaymentStatusTransition()` enforcing strict state graph

### 6. Domain Services ✓
- `src/domains/payments/services/payment-service.ts`:
  - `chargeSplitPayments()` — idempotent split payment charging via gateway abstraction
  - `recordStatusTransition()` — validates and logs status changes to the ledger

- `src/domains/customers/services/store-credit-service.ts`:
  - `redeem()` — debit with balance validation
  - `issue()` — credit for refunds/issuances
  - Private `applyTransaction()` shared method

- `src/domains/payments/services/refund-service.ts`:
  - `refund()` — full/partial refunds, stock reversal, permission-ready (caller supplies `initiatedBy`)
  - Validates refund amount against existing refunds
  - Triggers stock movements via `InventoryService.recordReturn()`
  - Updates payment status to PARTIALLY_REFUNDED or REFUNDED

### 7. Gateway Registry ✓
- `src/infrastructure/payments/gateway-registry.ts` — factory-based registry matching storage-driver pattern

### 8. Adapters ✓
- **CashGateway** (`src/infrastructure/payments/adapters/cash/`)
  - Charge: validates tendered >= amount, calculates change with integer-cent math, publishes drawer.kick event
  - Refund: publishes drawer.kick event
  - Returns CAPTURED / COMPLETED immediately

- **StoreCreditGateway** (`src/infrastructure/payments/adapters/store-credit/`)
  - Charge: calls `StoreCreditService.redeem()`, throws `InsufficientStoreCreditError` on failure
  - Refund: calls `StoreCreditService.issue()` to re-credit
  - Returns CAPTURED / COMPLETED immediately

- **FakeGateway** (`src/infrastructure/payments/adapters/fake/`)
  - Test-only, never auto-registered
  - Configurable behavior: always-capture, always-decline, always-pending
  - In-memory idempotency maps for charge & refund
  - `requiresServer: true` (simulates async provider)

### 9. Infrastructure Wiring ✓
- `src/infrastructure/payments/index.ts` — imports cash and store-credit (not fake), re-exports registry
- `src/infrastructure/events/payments-event-bus.ts` — `InProcessEventBus<PaymentEvent>` for drawer-kick / payment events
- `src/infrastructure/payments/adapters/payment-gateway-conformance.ts` — shared contract test suite

### 10. Storage Layer ✓
- Updated `src/infrastructure/storage/core/schema.ts`:
  - Added `paymentStatusEvents: 'payments'`, `storeCreditTransactions: 'customers'` to COLLECTIONS
  - Bumped `CURRENT_SCHEMA_VERSION` to 7

- Updated `src/infrastructure/storage/adapters/indexeddb/schema.ts`:
  - Added indexes: `paymentStatusEvents: 'id, paymentId, createdAt'`, `storeCreditTransactions: 'id, customerId, createdAt'`
  - Re-indexed payments: added `gateway` to `'id, saleId, status, createdAt, shiftId, gateway'`
  - Re-indexed refunds: added `status` to `'id, paymentId, status, createdAt'`
  - Added version 7 migration block in `buildVersionChain()`

- Updated `src/infrastructure/storage/core/repositories/payments-repository.ts` — added `paymentStatusEventCollection`, implemented new repository methods
- Updated `src/infrastructure/storage/core/repositories/customers-repository.ts` — added `storeCreditTransactionCollection`, implemented new methods

### 11. Documentation ✓
- `docs/payments.md` — comprehensive guide covering:
  - Gateway table (cash, store-credit, fake shipped; stripe/bkash/sslcommerz designed)
  - "Adding a new gateway" checklist (4 steps, zero checkout code changes)
  - "What activates when a server deployment exists" (webhook verification, idempotent event store, async reconciliation, secrets)
  - Status transition graph
  - Sync vs. async gateway design pattern
  - Store credit ledger architecture

## Pending

### 1. Sales Integration
- **File**: `src/domains/sales/services/finalize-sale-service.ts`
- **Changes needed**:
  1. Add `PaymentService` to constructor
  2. Update `FinalizeSaleInput.payments[]` type to include `id: string`, `gateway: string`, `tendered?: number`, `customerId?: string`
  3. Add `CustomersRepository` to `finalize()` repos parameter
  4. Replace inline payment-creation loop with call to `paymentService.chargeSplitPayments()`
  5. Current loop (lines 226–238) becomes ~10 lines delegating to service
- **Zero changes** to any other sales code

### 2. Refund Action
- **File**: `src/domains/payments/actions/create-refund.ts`
- **Structure**: mirrors `src/domains/catalog/actions/save-product.ts`
- **Steps**:
  1. Parse input (orgId, branchId, paymentId, saleId, amount, reason, items?)
  2. Get session via `getCurrentSession()`, 401 if absent
  3. `provider.withTransaction()` with `requireAdminMembership()` check inside
  4. Call `new RefundService(...).refund(repos, {...})`
  5. `toErrorResponse()` on catch, `provider.close()` in finally

### 3. Tests
All tests follow vitest patterns already in the codebase:

- **Unit**: `src/domains/payments/services/payment-status-machine.test.ts`
  - Exhaustive transition matrix over all (from, to) pairs

- **Unit**: `src/domains/payments/lib/split-payment.test.ts`
  - Exact sum passes, off-by-penny fails, floating-point edge cases (33.33 + 33.33 + 33.33 = 99.99)

- **Property**: `src/domains/payments/lib/split-payment.property.test.ts` ← uses `fast-check`
  - Valid sums never throw
  - ±1-cent mismatch always throws
  - Summation is order-independent
  - (Requires `fast-check` as new devDependency in package.json)

- **Integration**: `src/domains/payments/services/payment-service.test.ts`
  - Happy path: split payment with cash + store-credit
  - Idempotency: same request.id twice = one charge
  - Mismatched total before any gateway call
  - Insufficient store credit doesn't roll back earlier splits within the service

- **Integration**: `src/domains/payments/services/refund-service.test.ts`
  - Full refund, partial refund with items (stock reversal)
  - Refund exceeding balance rejected
  - Nonexistent payment → NotFoundError
  - Store-credit refund re-credits customer

- **Integration**: `src/domains/customers/services/store-credit-service.test.ts`
  - Redeem/issue happy path
  - Insufficient balance rejected
  - `balanceAfter` consistency, monotonic ledger

- **Contract**: `src/infrastructure/payments/adapters/cash/gateway.test.ts`
  - Runs `runPaymentGatewayConformance()`
  - Cash-specific: change calculation, tendered < amount rejected, drawer.kick published

- **Contract**: `src/infrastructure/payments/adapters/fake/gateway.test.ts`
  - Runs `runPaymentGatewayConformance()` ← **this is the "fake-gateway test proves contract" acceptance line**
  - Idempotency-replay assertions

- **Contract**: `src/infrastructure/payments/adapters/store-credit/gateway.test.ts`
  - Runs `runPaymentGatewayConformance()`
  - Insufficient-balance decline

- **Integration**: `src/domains/sales/services/finalize-sale-service.test.ts` (new file)
  - Minimal happy path: two-way split payment, both complete
  - Asserts two Payment rows, Sale.total matches sum

- **Conformance**: `src/infrastructure/storage/conformance/suites/refund-atomicity.ts`
  - Seed Sale + Payment (CAPTURED, amount 100) + StockLevel
  - Call `RefundService.refund()` with items, but inject failure in inventory call
  - Assert: Refund row doesn't exist, Payment.status unchanged, StockLevel untouched

- **Conformance**: `src/infrastructure/storage/conformance/suites/crud.ts`
  - Extend for `paymentStatusEvents`, `storeCreditTransactions`
  - CRUD coverage for new fields (gateway, status on payments/refunds)

### 4. Verify & Cleanup
- [ ] `npm run typecheck` — catches missing types
- [ ] `npm run lint` — eslint-plugin-boundaries enforces no `payments → sales` import
- [ ] `npm run test` — all test suites pass
- [ ] `npm run test:conformance:node` — storage conformance on in-memory driver
- [ ] `npm run test:conformance:browser` — storage conformance on IndexedDB

## Architecture Decisions Locked

1. **Status returned, not thrown**: `charge()` and `refund()` return `status: FAILED` for decline, throw only for setup/programmer errors
2. **Strict payment status graph**: Transitions are validated per `isValidPaymentStatusTransition()`, preventing nonsensical replays
3. **Payments never imports sales**: Even though sales imports payments. Low coupling; isolated testability
4. **Context carries `repos`**: Sync gateways ignore it; async gateways (future) will use `ids`/`clock` only for charge/refund, ignore `repos` (no shared transaction across network calls)
5. **Fake never auto-registered**: `src/infrastructure/payments/index.ts` is production-only; tests explicitly register fake in setup
6. **FinalizeSaleService changes exactly once**: One call to `chargeSplitPayments()` replaces inline creation. Adding Stripe requires **zero checkout edits**
7. **Webhook & idempotent store interface-only**: Designed now, implemented when server deployment exists
8. **Refund permissions at action layer**: `create-refund.ts` calls `requireAdminMembership()`, not the service
9. **Refund `refundedItems` optional**: No separate enum; empty array = monetary adjustment, non-empty = stock reversal
10. **No second ledger for refunds**: `Refund.status` is materialized (2 states: COMPLETED/FAILED). Audit trail via existing `AuditRepository` (ADMIN-gated action log)

## Key Files Summary

| File | Purpose |
|------|---------|
| `src/constants/enums/payment-status.ts` | Status enum (numeric for comparability) |
| `src/constants/enums/refund-status.ts` | Refund status enum |
| `src/domains/payments/entities/payment.ts` | Payment entity with gateway + status fields |
| `src/domains/payments/entities/payment-status-event.ts` | Append-only status change ledger |
| `src/domains/payments/ports/payment-gateway.ts` | `PaymentGateway` interface |
| `src/domains/payments/services/payment-service.ts` | Charge & status transition orchestration |
| `src/domains/payments/services/refund-service.ts` | Refund with stock reversal |
| `src/domains/customers/services/store-credit-service.ts` | Store credit ledger |
| `src/infrastructure/payments/gateway-registry.ts` | Factory registry |
| `src/infrastructure/payments/adapters/cash/gateway.ts` | Cash adapter |
| `src/infrastructure/payments/adapters/store-credit/gateway.ts` | Store credit adapter |
| `src/infrastructure/payments/adapters/fake/gateway.ts` | Test double (async sim) |
| `src/infrastructure/storage/core/repositories/payments-repository.ts` | Payments + status events CRUD |
| `src/infrastructure/storage/core/repositories/customers-repository.ts` | Customers + credit transactions CRUD |
| `docs/payments.md` | Full system documentation |

---

**Next Step**: Implement pending sales integration (finalize-sale-service update) and tests. Then run full test suite and conformance suite to verify. Zero checkout code changes required for future gateways.
