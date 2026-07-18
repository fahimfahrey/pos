export interface EventBus<E> {
  publish(event: E): void
  subscribe(handler: (event: E) => void): () => void
}
