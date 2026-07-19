import { registerPaymentGateway } from '../../gateway-registry'
import { StoreCreditGateway } from './gateway'

registerPaymentGateway('store-credit', () => new StoreCreditGateway())
