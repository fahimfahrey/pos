import { describe, it, expect } from 'vitest'
import { InProcessEventBus } from './in-process-event-bus'

describe('InProcessEventBus', () => {
  it('publishes to all subscribers', () => {
    const bus = new InProcessEventBus<{ type: string; value: number }>()
    const results: number[] = []

    bus.subscribe((event) => results.push(event.value))
    bus.subscribe((event) => results.push(event.value * 2))

    bus.publish({ type: 'test', value: 5 })

    expect(results).toEqual([5, 10])
  })

  it('unsubscribe stops delivery', () => {
    const bus = new InProcessEventBus<{ type: string }>()
    const results: string[] = []

    const unsub = bus.subscribe((event) => results.push(event.type))
    bus.publish({ type: 'first' })

    unsub()
    bus.publish({ type: 'second' })

    expect(results).toEqual(['first'])
  })

  it('subscribing during publish does not receive in-flight event', () => {
    const bus = new InProcessEventBus<{ type: string }>()
    const results: string[] = []

    bus.subscribe(() => {
      bus.subscribe((event) => results.push(event.type))
    })

    bus.publish({ type: 'test' })

    expect(results).toEqual([])
  })

  it('multiple unsubscribe calls are safe', () => {
    const bus = new InProcessEventBus<{ type: string }>()
    const unsub = bus.subscribe(() => {})

    unsub()
    unsub()

    expect(() => {
      bus.publish({ type: 'test' })
    }).not.toThrow()
  })
})
