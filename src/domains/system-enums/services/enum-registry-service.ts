import { z } from 'zod'
import type { SystemEnumValueRepository } from '../repository'
import type { SystemEnumValue } from '../entities/system-enum-value'
import { STATIC_ENUM_VALUES, type EnumRegistryKey } from '@constants/enums'
import { ConflictError } from '@shared/errors'

export class EnumRegistryService {
  constructor(private repo: SystemEnumValueRepository) {}

  /** Static registry ∪ org's active runtime values for one category. */
  async resolveValues(orgId: string, key: EnumRegistryKey): Promise<string[]> {
    const runtime = await this.repo.listForOrgAndKey(orgId, key)
    const runtimeValues = runtime.filter((v) => v.active).map((v) => v.value)
    return Array.from(new Set([...STATIC_ENUM_VALUES[key], ...runtimeValues]))
  }

  /** A Zod enum schema over the merged set — used at every validation boundary. */
  async schemaFor(orgId: string, key: EnumRegistryKey): Promise<z.ZodEnum<[string, ...string[]]>> {
    const merged = await this.resolveValues(orgId, key)
    return z.enum(merged as [string, ...string[]])
  }

  /** Add a runtime value; rejects a duplicate (orgId, registryKey, value). */
  async addValue(input: {
    id: string
    orgId: string
    registryKey: EnumRegistryKey
    value: string
    label: string
    createdBy: string
    now: Date
  }): Promise<SystemEnumValue> {
    if (STATIC_ENUM_VALUES[input.registryKey].includes(input.value)) {
      throw new ConflictError(`"${input.value}" is already a static ${input.registryKey} value`)
    }
    const existing = await this.repo.listForOrgAndKey(input.orgId, input.registryKey)
    if (existing.some((v) => v.value === input.value)) {
      throw new ConflictError(`"${input.value}" already exists for this organization`)
    }
    const record: SystemEnumValue = {
      id: input.id,
      orgId: input.orgId,
      registryKey: input.registryKey,
      value: input.value,
      label: input.label,
      active: true,
      createdAt: input.now,
      updatedAt: input.now,
      createdBy: input.createdBy,
    }
    await this.repo.save(record)
    return record
  }
}
