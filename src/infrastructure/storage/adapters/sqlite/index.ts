import { SqliteDriver } from './driver'
import { registerEngine } from '../../core/engine-registry'

// Register the SQLite engine for server-side use
// Note: This module should only be imported from server-only contexts,
// never from the shared storage/index.ts which is reachable from client code.
registerEngine('sqlite', (opts: { filename?: string; ephemeral?: boolean } = {}) => {
  return new SqliteDriver(opts)
})

export { SqliteDriver }
