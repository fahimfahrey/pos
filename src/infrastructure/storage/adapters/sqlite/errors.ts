import { StorageError } from '../../core/errors'

export class StorageLockedError extends StorageError {
  constructor(message: string = 'Database is locked', cause?: Error) {
    super('STORAGE_LOCKED', message, cause)
    Object.setPrototypeOf(this, StorageLockedError.prototype)
  }
}

export class StorageConstraintError extends StorageError {
  constructor(message: string = 'Constraint violation', cause?: Error) {
    super('STORAGE_CONSTRAINT', message, cause)
    Object.setPrototypeOf(this, StorageConstraintError.prototype)
  }
}

/**
 * Map better-sqlite3 errors to typed storage errors.
 * Idempotent: if already a StorageError, pass through.
 */
export function mapSqliteError(err: unknown): StorageError {
  // Already a storage error, return as-is
  if (err instanceof StorageError) {
    return err
  }

  if (err instanceof Error) {
    const message = err.message || String(err)

    // SQLITE_BUSY - database is locked
    if (message.includes('SQLITE_BUSY') || message.includes('database is locked')) {
      return new StorageLockedError(message, err)
    }

    // SQLITE_CONSTRAINT - constraint violation
    if (message.includes('SQLITE_CONSTRAINT')) {
      return new StorageConstraintError(message, err)
    }

    // Generic storage error
    return new StorageError('STORAGE_ENGINE_ERROR', `SQLite error: ${message}`, err)
  }

  // Non-Error object
  const message = String(err)
  return new StorageError('STORAGE_ENGINE_ERROR', `SQLite error: ${message}`)
}
