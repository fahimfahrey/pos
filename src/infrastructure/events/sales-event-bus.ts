import type { SalesEvent } from '@domains/sales/events'
import { InProcessEventBus } from '../adapters/in-process-event-bus'

export const salesEventBus = new InProcessEventBus<SalesEvent>()
