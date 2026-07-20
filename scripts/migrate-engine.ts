#!/usr/bin/env node

import { createStorageProvider } from '@infra/storage/server'
import { computeChecksum, verifyChecksum } from './lib/checksum'

/**
 * Engine migration CLI script.
 * Exports data from one storage engine and imports it into another,
 * verifying row counts and checksums for data integrity.
 *
 * Usage:
 *   tsx scripts/migrate-engine.ts --from memory --to sqlite
 *   tsx scripts/migrate-engine.ts --from sqlite --to memory
 */

async function main() {
  const args = process.argv.slice(2)
  const fromIdx = args.indexOf('--from')
  const toIdx = args.indexOf('--to')
  const verifyOnlyIdx = args.indexOf('--verify-only')

  if (fromIdx === -1 || toIdx === -1) {
    console.error('Usage: migrate-engine.ts --from <engine> --to <engine> [--verify-only]')
    console.error('Example: migrate-engine.ts --from memory --to sqlite')
    process.exit(1)
  }

  const fromEngine = args[fromIdx + 1]
  const toEngine = args[toIdx + 1]
  const verifyOnly = verifyOnlyIdx !== -1

  if (!fromEngine || !toEngine) {
    console.error('Error: --from and --to engines must be specified')
    process.exit(1)
  }

  try {
    console.log(`\n📦 Storage Engine Migration`)
    console.log(`From: ${fromEngine}`)
    console.log(`To: ${toEngine}`)
    console.log(`Mode: ${verifyOnly ? 'verify-only (no import)' : 'export→import→verify'}\n`)

    // Create source provider
    console.log(`1. Opening source engine (${fromEngine})...`)
    const sourceProvider = await createStorageProvider({ engine: fromEngine })

    // Export all data
    console.log(`2. Exporting data...`)
    const exportedData = await sourceProvider.exportAll()

    if (!exportedData.entities || exportedData.entities.length === 0) {
      console.error('Error: No data to export')
      await sourceProvider.close()
      process.exit(1)
    }

    // Compute checksums on source
    console.log(`3. Computing checksums on source...`)
    const sourceChecksums: Record<string, { rowCount: number; digest: string }> = {}
    for (const envelope of exportedData.entities) {
      const checksum = await computeChecksum(envelope.records)
      sourceChecksums[envelope.entity] = checksum
      console.log(`   ${envelope.entity}: ${checksum.rowCount} rows`)
    }

    await sourceProvider.close()

    if (verifyOnly) {
      console.log(`\n✓ Verify-only mode: checksums computed but not imported`)
      console.log(`   Source checksums computed for ${Object.keys(sourceChecksums).length} collections\n`)
      process.exit(0)
    }

    // Create target provider
    console.log(`\n4. Opening target engine (${toEngine})...`)
    const targetProvider = await createStorageProvider({ engine: toEngine })

    // Import data
    console.log(`5. Importing data...`)
    await targetProvider.importAll(exportedData, { mode: 'replace' })

    // Export again to verify
    console.log(`6. Verifying by re-exporting from target...`)
    const verifyData = await targetProvider.exportAll()

    if (!verifyData.entities || verifyData.entities.length === 0) {
      console.error('Error: Re-export returned no data')
      await targetProvider.close()
      process.exit(1)
    }

    // Compute checksums on target
    console.log(`7. Computing checksums on target...\n`)
    const targetChecksums: Record<string, { rowCount: number; digest: string }> = {}
    const mismatches: string[] = []

    for (const envelope of verifyData.entities) {
      const checksum = await computeChecksum(envelope.records)
      targetChecksums[envelope.entity] = checksum
      const sourceChecksum = sourceChecksums[envelope.entity] || { rowCount: 0, digest: '' }
      const result = verifyChecksum(sourceChecksum, checksum, envelope.entity)

      console.log(`   ${result.message}`)

      if (!result.success) {
        mismatches.push(result.message)
      }
    }

    await targetProvider.close()

    // Summary
    console.log('\n📊 Migration Summary:')
    console.log(`   Collections checked: ${verifyData.entities.length}`)
    console.log(`   Mismatches: ${mismatches.length}`)

    if (mismatches.length > 0) {
      console.log('\n❌ Verification failed:')
      for (const mismatch of mismatches) {
        console.log(`   ${mismatch}`)
      }
      process.exit(1)
    }

    console.log('\n✓ Migration successful! All checksums match.\n')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Migration failed:', err)
    process.exit(1)
  }
}

main()
