import type { SchemaStep, MigrationContext } from '@infra/storage'

/**
 * Three-step migration ladder for conformance testing of schema versioning.
 * Demonstrates up/down migrations through multiple versions.
 */

export const migrationLadder: SchemaStep[] = [
  {
    version: 1,
    description: 'Initialize test collection',
    async migrate(ctx: MigrationContext) {
      // Create test collection implicitly on first use
      await ctx.createCollection('organizationSettings' as any)
    },
    async down(ctx: MigrationContext) {
      // No-op for v1 down (it's the base version)
    },
  },
  {
    version: 2,
    description: 'Add testField to organizationSettings',
    async migrate(ctx: MigrationContext) {
      const coll = ctx.collection<any>('organizationSettings' as any)
      const records = await coll.getAll()

      // Add testField to each record
      for (const record of records) {
        await coll.put({
          ...record,
          testField: `v2-${record.id}`,
        })
      }
    },
    async down(ctx: MigrationContext) {
      const coll = ctx.collection<any>('organizationSettings' as any)
      const records = await coll.getAll()

      // Remove testField from each record
      for (const record of records) {
        const { testField: _, ...rest } = record
        await coll.put(rest)
      }
    },
  },
  {
    version: 3,
    description: 'Add derivedField to organizationSettings',
    async migrate(ctx: MigrationContext) {
      const coll = ctx.collection<any>('organizationSettings' as any)
      const records = await coll.getAll()

      // Add derivedField based on testField or id
      for (const record of records) {
        const testField = record.testField ?? ''
        await coll.put({
          ...record,
          derivedField: `derived-${testField}`,
        })
      }
    },
    async down(ctx: MigrationContext) {
      const coll = ctx.collection<any>('organizationSettings' as any)
      const records = await coll.getAll()

      // Remove derivedField from each record
      for (const record of records) {
        const { derivedField: _, ...rest } = record
        await coll.put(rest)
      }
    },
  },
]
