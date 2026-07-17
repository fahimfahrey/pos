import { describe } from 'vitest'
import { runStorageProviderConformance } from './storage-conformance'
import { defaultConformanceAdapters } from './adapters'

/**
 * Matrix runner for storage conformance tests.
 * Loops through all registered adapters and runs the full conformance suite against each.
 * Adding a new adapter = adding one entry to defaultConformanceAdapters; CI expands automatically.
 */

// Optional: filter to a specific adapter via CONFORMANCE_ADAPTER env var
const selectedAdapterName = process.env.CONFORMANCE_ADAPTER

const adaptersToTest = selectedAdapterName
  ? defaultConformanceAdapters.filter((a) => a.name === selectedAdapterName)
  : defaultConformanceAdapters

if (adaptersToTest.length === 0 && selectedAdapterName) {
  throw new Error(
    `CONFORMANCE_ADAPTER="${selectedAdapterName}" not found in registry. Available: ${defaultConformanceAdapters.map((a) => a.name).join(', ')}`,
  )
}

for (const adapter of adaptersToTest) {
  runStorageProviderConformance(adapter, defaultConformanceAdapters)
}
