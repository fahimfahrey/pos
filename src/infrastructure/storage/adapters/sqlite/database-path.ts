import path from 'path'

/**
 * Resolves the SQLite database file path.
 * Returns ':memory:' for ephemeral (in-memory) mode, else a persisted file path.
 */
export function resolveDatabasePath(opts: {
  ephemeral?: boolean
  filename?: string
}): string {
  if (opts.ephemeral) {
    return ':memory:'
  }

  if (opts.filename) {
    return opts.filename
  }

  // Default: use a file in the project's data directory
  // This matches the pattern of the indexeddb adapter's ephemeralDatabaseName
  const dataDir = path.join(process.cwd(), '.data')
  return path.join(dataDir, 'pos.db')
}
