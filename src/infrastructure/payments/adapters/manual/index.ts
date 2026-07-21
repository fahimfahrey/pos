import { registerPaymentGateway } from '../../gateway-registry'
import { ManualGateway } from './gateway'

registerPaymentGateway('manual', () => new ManualGateway())
