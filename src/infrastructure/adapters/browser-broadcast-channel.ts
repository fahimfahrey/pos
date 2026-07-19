import type { BroadcastPort } from '@shared/ports/broadcast-channel'
import { logger } from '@shared/logger'

export class BrowserBroadcastChannel<E> implements BroadcastPort<E> {
  private channel: BroadcastChannel | null = null
  private handlers = new Set<(event: E) => void>()

  constructor(channelName: string) {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(channelName)
        this.channel.onmessage = (event) => {
          const data = event.data as E
          for (const handler of this.handlers) {
            handler(data)
          }
        }
      } catch (error) {
        logger.warn(`BroadcastChannel not available: ${error}`)
      }
    }
  }

  publish(event: E): void {
    if (!this.channel) {
      logger.warn(
        'BroadcastChannel not available; publish() is a no-op. Event not broadcast.',
      )
      return
    }

    try {
      this.channel.postMessage(event)
    } catch (error) {
      logger.error(`Failed to broadcast message: ${error}`)
    }
  }

  subscribe(handler: (event: E) => void): () => void {
    this.handlers.add(handler)

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler)
    }
  }

  close(): void {
    if (this.channel) {
      try {
        this.channel.close()
      } catch (error) {
        logger.warn(`Failed to close BroadcastChannel: ${error}`)
      }
      this.channel = null
    }
    this.handlers.clear()
  }
}
