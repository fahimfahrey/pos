import './adapters/cash'
import './adapters/store-credit'

export { registerPaymentGateway, resolvePaymentGateway, getRegisteredPaymentGateways } from './gateway-registry'
export type { PaymentGatewayFactory } from './gateway-registry'
