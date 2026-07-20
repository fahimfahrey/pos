import 'server-only'

// Import SQLite adapter for its registration side-effect
// This module is server-only and safe to import better-sqlite3
import './adapters/sqlite'

// Re-export the public API for server-side use
export * from './core'
export * from './default-provider'
