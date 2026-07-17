import { describe, beforeEach, afterEach } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import type { ConformanceAdapter } from './types'
import { runCrudSuite } from './suites/crud'
import { runUlidKeysSuite } from './suites/ulid-keys'
import { runTenantScopingSuite } from './suites/tenant-scoping'
import { runUnitOfWorkSuite } from './suites/unit-of-work'
import { runConcurrencySuite } from './suites/concurrency'
import { runSchemaSuite } from './suites/schema-versioning'
import { runExportImportSuite } from './suites/export-import'
import { defaultConformanceAdapters } from './adapters'

export function runStorageProviderConformance(
  adapter: ConformanceAdapter,
  allAdapters: ConformanceAdapter[] = defaultConformanceAdapters,
): void {
  describe(`Storage conformance: ${adapter.name}`, () => {
    let provider: StorageProvider

    beforeEach(async () => {
      provider = await adapter.createProvider()
    })

    afterEach(async () => {
      await provider.close()
    })

    const getProvider = () => provider

    describe('CRUD', () => {
      runCrudSuite(getProvider)
    })

    describe('ULID', () => {
      runUlidKeysSuite(getProvider, adapter)
    })

    describe('Tenant', () => {
      runTenantScopingSuite(getProvider, adapter)
    })

    describe('UnitOfWork', () => {
      runUnitOfWorkSuite(getProvider)
    })

    describe('Concurrency', () => {
      runConcurrencySuite(getProvider, adapter)
    })

    describe('ExportImport', () => {
      runExportImportSuite(getProvider, adapter, allAdapters)
    })

    describe('Schema versioning', () => {
      runSchemaSuite(getProvider, adapter)
    })
  })
}
