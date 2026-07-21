'use client'

// Re-export from shared for backwards compatibility
export { usePendingSyncCount as useOutboxCount, useOldestPendingAge, getPendingSyncQueue as getOutbox, type OutboxEntry } from '@shared/lib/pending-sync'
