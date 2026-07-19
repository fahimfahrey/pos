import type { PaymentGateway } from '@domains/payments/ports/payment-gateway'
import { GatewayNotRegisteredError } from '@domains/payments/errors'

export type PaymentGatewayFactory = () => PaymentGateway

const registry = new Map<string, PaymentGatewayFactory>()

export function registerPaymentGateway(id: string, factory: PaymentGatewayFactory): void {
  registry.set(id, factory)
}

export function resolvePaymentGateway(id: string): PaymentGateway {
  const factory = registry.get(id)
  if (!factory) {
    const available = Array.from(registry.keys()).join(', ')
    throw new GatewayNotRegisteredError(
      `Payment gateway '${id}' not registered. Available: ${available}`,
    )
  }
  return factory()
}

export function getRegisteredPaymentGateways(): string[] {
  return Array.from(registry.keys())
}
