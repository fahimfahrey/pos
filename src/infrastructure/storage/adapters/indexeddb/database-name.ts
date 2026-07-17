/**
 * Resolve the production database name.
 * Kept in a function for easy env override in the future.
 */
export function resolveDatabaseName(): string {
  return 'pos-storage'
}

/**
 * Generate a unique ephemeral database name for conformance/testing.
 * Each instance gets a unique name to ensure isolation.
 */
let counter = 0
export function ephemeralDatabaseName(): string {
  return `pos-conformance-${Date.now().toString(36)}-${counter++}`
}
