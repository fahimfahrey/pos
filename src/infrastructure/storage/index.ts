// Import adapters for their side-effect registrations
import './adapters/memory'
import './adapters/indexeddb'

// Re-export the public API
export * from './core'
export * from './default-provider'
