import type { EventBus } from '@shared/ports/event-bus'

export class InProcessEventBus<E> implements EventBus<E> {
  private subscribers = new Set<(event: E) => void>()

  publish(event: E): void {
    this.subscribers.forEach((handler) => {
      handler(event)
    })
  }

  subscribe(handler: (event: E) => void): () => void {
    this.subscribers.add(handler)
    return () => {
      this.subscribers.delete(handler)
    }
  }
}
