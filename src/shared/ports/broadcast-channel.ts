export interface BroadcastPort<E> {
  publish(event: E): void
  subscribe(handler: (event: E) => void): () => void
  close(): void
}
