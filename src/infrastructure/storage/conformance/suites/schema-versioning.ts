import { describe, it, expect, beforeEach } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import { SchemaVersioner, resolveEngine } from '@infra/storage'
import { migrationLadder } from '../migration-ladder'
import type { ConformanceAdapter } from '../types'

export function runSchemaSuite(getProvider: () => StorageProvider, adapter: ConformanceAdapter): void {
  // Get a fresh driver instance to test migrations
  const engine = resolveEngine(adapter.engine)
  let driver: any

  describe('Schema versioning (up/down across 3 versions)', () => {
    beforeEach(async () => {
      if (engine) {
        driver = await engine()
      }
    })

    it('should upgrade through all versions', async () => {
      if (!driver) {
        // Skip if driver not available
        return
      }

      try {
        const versioner = new SchemaVersioner(migrationLadder)

        // Start at v1
        let version = await driver.getSchemaVersion()
        expect(version).toBeLessThanOrEqual(3)

        // Migrate to v3
        await versioner.migrateTo(driver, 3)

        version = await driver.getSchemaVersion()
        expect(version).toBe(3)

        // Verify data transformation occurred
        // Verify data transformation occurred
        await driver.transaction(['organizations'], 'readonly', async (tx: any) => {
          const records = await tx.getAll('organizations')
          // After v3, records should have derivedField if they had data
          for (const record of records) {
            if (record.testField !== undefined) {
              expect(record.derivedField).toBeDefined()
            }
          }
        })
      } finally {
        if (driver?.close) {
          await driver.close()
        }
      }
    })

    it('should downgrade through versions', async () => {
      if (!driver) {
        return
      }

      try {
        const versioner = new SchemaVersioner(migrationLadder)

        // Upgrade first
        await versioner.migrateTo(driver, 3)
        let version = await driver.getSchemaVersion()
        expect(version).toBe(3)

        // Now downgrade to v1
        await versioner.migrateTo(driver, 1)
        version = await driver.getSchemaVersion()
        expect(version).toBe(1)

        // Verify transformations reversed
        // Verify transformations reversed
        await driver.transaction(['organizations'], 'readonly', async (tx: any) => {
          const records = await tx.getAll('organizations')
          for (const record of records) {
            // After downgrade, derived fields should be gone
            expect(record.derivedField).toBeUndefined()
          }
        })
      } finally {
        if (driver?.close) {
          await driver.close()
        }
      }
    })

    it('should preserve version number through down migration', async () => {
      if (!driver) {
        return
      }

      try {
        const versioner = new SchemaVersioner(migrationLadder)

        // Go to v3
        await versioner.migrateTo(driver, 3)
        const v3 = await driver.getSchemaVersion()
        expect(v3).toBe(3)

        // Go to v2
        await versioner.migrateTo(driver, 2)
        const v2 = await driver.getSchemaVersion()
        expect(v2).toBe(2)

        // Go back to v3
        await versioner.migrateTo(driver, 3)
        const v3Again = await driver.getSchemaVersion()
        expect(v3Again).toBe(3)
      } finally {
        if (driver?.close) {
          await driver.close()
        }
      }
    })

    it('should handle round-trip migration (up then down)', async () => {
      if (!driver) {
        return
      }

      try {
        const versioner = new SchemaVersioner(migrationLadder)

        // Record initial state
        const initialVersion = await driver.getSchemaVersion()

        // Go up to v3
        await versioner.migrateTo(driver, 3)
        const v3 = await driver.getSchemaVersion()
        expect(v3).toBe(3)

        // Go back to initial
        await versioner.migrateTo(driver, initialVersion)
        const finalVersion = await driver.getSchemaVersion()
        expect(finalVersion).toBe(initialVersion)
      } finally {
        if (driver?.close) {
          await driver.close()
        }
      }
    })

    it('should skip if target version equals current', async () => {
      if (!driver) {
        return
      }

      try {
        const versioner = new SchemaVersioner(migrationLadder)

        const current = await driver.getSchemaVersion()

        // Call migrateTo with same version - should be no-op
        await versioner.migrateTo(driver, current)

        const after = await driver.getSchemaVersion()
        expect(after).toBe(current)
      } finally {
        if (driver?.close) {
          await driver.close()
        }
      }
    })
  })
}
