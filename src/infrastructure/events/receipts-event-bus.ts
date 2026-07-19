import type { ReceiptEvent } from '@domains/receipts/events'
import { InProcessEventBus } from '../adapters/in-process-event-bus'

export const receiptsEventBus = new InProcessEventBus<ReceiptEvent>()
