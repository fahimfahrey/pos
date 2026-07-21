'use client'

import React from 'react'

/**
 * Minimal client-side pending-write queue for offline-first visibility.
 * Does not persist across page reloads (kept in-memory).
 * Future: integrate with actual sync engine when built.
 */

export interface OutboxEntry {
  id: string
  kind: 'finalize-sale' | 'hold-cart' | 'resume-cart'
  payload: Record<string, unknown>
  attemptedAt: number
  resolved?: boolean
}

type OutboxListener = (entries: OutboxEntry[]) => void

class PendingSyncQueue {
  private entries: OutboxEntry[] = []
  private listeners: Set<OutboxListener> = new Set()
  private nextId = 0

  addEntry(kind: OutboxEntry['kind'], payload: Record<string, unknown>): OutboxEntry {
    const entry: OutboxEntry = {
      id: `outbox-${this.nextId++}`,
      kind,
      payload,
      attemptedAt: Date.now(),
    }

    this.entries.push(entry)
    this.notifyListeners()
    return entry
  }

  markResolved(entryId: string): void {
    const entry = this.entries.find((e) => e.id === entryId)
    if (entry) {
      entry.resolved = true
      this.notifyListeners()
    }
  }

  getPendingCount(): number {
    return this.entries.filter((e) => !e.resolved).length
  }

  subscribe(listener: OutboxListener): () => void {
    this.listeners.add(listener)
    listener(this.getPendingEntries())

    return () => {
      this.listeners.delete(listener)
    }
  }

  private getPendingEntries(): OutboxEntry[] {
    return this.entries.filter((e) => !e.resolved)
  }

  private notifyListeners(): void {
    const pending = this.getPendingEntries()
    this.listeners.forEach((listener) => listener(pending))
  }

  // For testing
  clear(): void {
    this.entries = []
    this.notifyListeners()
  }
}

const pendingSync = new PendingSyncQueue()

export function usePendingSyncCount() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const unsubscribe = pendingSync.subscribe((entries) => {
      setCount(entries.length)
    })
    return unsubscribe
  }, [])

  return count
}

export function useOldestPendingAge(): number {
  const [age, setAge] = React.useState(0)

  React.useEffect(() => {
    const unsubscribe = pendingSync.subscribe((entries) => {
      if (entries.length === 0) {
        setAge(0)
        return
      }

      const oldest = entries[0]
      const computeAge = () => {
        setAge(Date.now() - oldest.attemptedAt)
      }

      computeAge()
      const interval = setInterval(computeAge, 250)

      return () => clearInterval(interval)
    })

    return unsubscribe
  }, [])

  return age
}

export function getPendingSyncQueue() {
  return pendingSync
}
