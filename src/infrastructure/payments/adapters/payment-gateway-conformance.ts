import { PAYMENT_STATUS, REFUND_STATUS } from '@constants/enums'
import type { PaymentGateway, PaymentGatewayContext } from '@domains/payments/ports/payment-gateway'

export async function runPaymentGatewayConformance(
  name: string,
  makeGateway: () => PaymentGateway,
  makeContext: () => PaymentGatewayContext,
): Promise<void> {
  const gateway = makeGateway()
  const ctx = makeContext()

  // Test 1: Gateway has required properties
  if (typeof gateway.id !== 'string' || gateway.id.length === 0) {
    throw new Error(`${name}: gateway.id must be a non-empty string`)
  }

  if (typeof gateway.requiresServer !== 'boolean') {
    throw new Error(`${name}: gateway.requiresServer must be a boolean`)
  }

  // Test 2: Successful charge returns valid ChargeResult
  const chargeResult = await gateway.charge(
    {
      saleId: 'test-sale-001',
      paymentId: 'test-payment-001',
      amount: 100.0,
      currency: 'USD',
      idempotencyKey: 'test-idempotency-001',
    },
    ctx,
  )

  if (!Object.values(PAYMENT_STATUS).includes(chargeResult.status)) {
    throw new Error(
      `${name}: charge result status must be a valid PaymentStatus, got ${chargeResult.status}`,
    )
  }

  // Test 3: Refund returns valid RefundResult
  const refundResult = await gateway.refund(
    {
      paymentId: 'test-payment-001',
      gatewayRef: chargeResult.gatewayRef,
      amount: 100.0,
      currency: 'USD',
      idempotencyKey: 'test-refund-001',
      reason: 'customer request',
    },
    ctx,
  )

  if (!Object.values(REFUND_STATUS).includes(refundResult.status)) {
    throw new Error(
      `${name}: refund result status must be a valid RefundStatus, got ${refundResult.status}`,
    )
  }

  console.log(`✓ ${name} gateway passed conformance suite`)
}
