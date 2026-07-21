import { registerPaymentGateway } from '../../gateway-registry'
import { CardGateway } from './gateway'

registerPaymentGateway('card', () => new CardGateway())
