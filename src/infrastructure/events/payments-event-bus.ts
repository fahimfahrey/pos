import type { PaymentEvent } from '@domains/payments/events'
import { InProcessEventBus } from '../adapters/in-process-event-bus'

export const paymentsEventBus = new InProcessEventBus<PaymentEvent>()
