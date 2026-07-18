import type { CatalogEvent } from '@domains/catalog/events'
import { InProcessEventBus } from '../adapters/in-process-event-bus'

export const catalogEventBus = new InProcessEventBus<CatalogEvent>()
