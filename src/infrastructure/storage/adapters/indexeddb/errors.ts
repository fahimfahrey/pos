import { StorageError } from '../../core/errors'

export class StorageQuotaError extends StorageError {
  constructor(message: string = 'Storage quota exceeded', cause?: Error) {
    super('STORAGE_QUOTA_EXCEEDED', message, cause)
    Object.setPrototypeOf(this, StorageQuotaError.prototype)
  }
}

export class StorageUpgradeBlockedError extends StorageError {
  constructor(
    message: string = 'Storage upgrade blocked by another tab',
    cause?: Error,
  ) {
    super('STORAGE_UPGRADE_BLOCKED', message, cause)
    Object.setPrototypeOf(this, StorageUpgradeBlockedError.prototype)
  }
}

export class StorageCloneError extends StorageError {
  constructor(
    message: string = 'Value contains non-cloneable content',
    cause?: Error,
  ) {
    super('STORAGE_CLONE_UNSUPPORTED', message, cause)
    Object.setPrototypeOf(this, StorageCloneError.prototype)
  }
}

export class StorageUnavailableError extends StorageError {
  constructor(message: string = 'IndexedDB is not available', cause?: Error) {
    super('STORAGE_UNAVAILABLE', message, cause)
    Object.setPrototypeOf(this, StorageUnavailableError.prototype)
  }
}

/**
 * Map IndexedDB/Dexie errors to typed storage errors.
 * Idempotent: if already a StorageError, pass through.
 */
export function mapIndexedDbError(err: unknown): StorageError {
  // Already a storage error, return as-is
  if (err instanceof StorageError) {
    return err
  }

  // Handle DOMException
  if (err instanceof DOMException) {
    if (err.name === 'QuotaExceededError') {
      return new StorageQuotaError(err.message, err as Error)
    }
    if (err.name === 'DataCloneError') {
      return new StorageCloneError(err.message, err as Error)
    }
    if (err.name === 'AbortError') {
      return new StorageUpgradeBlockedError(err.message, err as Error)
    }
  }

  // Handle Dexie-specific errors
  if (err instanceof Error) {
    const errName = (err as any).name
    if (errName === 'QuotaExceededError') {
      return new StorageQuotaError(err.message, err)
    }
    if (errName === 'DataCloneError') {
      return new StorageCloneError(err.message, err)
    }
    if (errName === 'AbortError') {
      return new StorageUpgradeBlockedError(err.message, err)
    }
  }

  // Generic storage error
  const cause = err instanceof Error ? err : undefined
  const message = cause?.message ?? String(err)
  return new StorageError('STORAGE_ENGINE_ERROR', `IndexedDB error: ${message}`, cause)
}
