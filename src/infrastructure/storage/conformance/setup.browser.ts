// Browser-mode setup for conformance testing
// Imports storage adapters WITHOUT fake-indexeddb to use real IndexedDB

// Register all adapters (including ephemeral IndexedDB engine)
import '@infra/storage'
import './adapters'
