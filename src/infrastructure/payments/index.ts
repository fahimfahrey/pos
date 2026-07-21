import './adapters/cash'
import './adapters/store-credit'
import './adapters/card'
import './adapters/manual'

export { registerPaymentGateway, resolvePaymentGateway, getRegisteredPaymentGateways } from './gateway-registry'
export type { PaymentGatewayFactory } from './gateway-registry'
