import { AppError } from '@shared/errors/app-error'

export class StorageError extends AppError {
  constructor(code: string, message: string, cause?: Error) {
    super(code, 500, message, cause)
    Object.setPrototypeOf(this, StorageError.prototype)
  }
}

export class UnknownEngineError extends StorageError {
  constructor(engine: string, registeredEngines: string[]) {
    super(
      'UNKNOWN_ENGINE',
      `Storage engine '${engine}' not found. Registered engines: ${registeredEngines.join(', ')}`,
    )
    Object.setPrototypeOf(this, UnknownEngineError.prototype)
  }
}

export class MigrationError extends StorageError {
  constructor(stepVersion: number, description: string, cause: Error) {
    super(
      'MIGRATION_FAILED',
      `Migration to version ${stepVersion} failed (${description}): ${cause.message}`,
      cause,
    )
    Object.setPrototypeOf(this, MigrationError.prototype)
  }
}

export class ImportFormatError extends StorageError {
  constructor(message: string) {
    super('IMPORT_FORMAT_INVALID', message)
    Object.setPrototypeOf(this, ImportFormatError.prototype)
  }
}
