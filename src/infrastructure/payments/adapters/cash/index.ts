import { registerPaymentGateway } from '../../gateway-registry'
import { CashGateway } from './gateway'

registerPaymentGateway('cash', () => new CashGateway())
