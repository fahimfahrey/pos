'use server'

import { revalidatePath } from 'next/cache'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { SystemClock } from '@infra/adapters/system-clock'
import { getCurrentSession } from '@domains/auth/actions/session'
import { requireOwnerMembership } from '@domains/auth/services/authorization-service'
import { EnumRegistryService } from '../services/enum-registry-service'
import { systemEnumValueInputSchema } from '../schemas/system-enum-value-input.schema'
import { toErrorResponse } from '@shared/errors'

export async function listEnumValues(orgId: string) {
  try {
    const provider = await getServerStorageProvider()
    const values = await provider.withTransaction(async (repos) => {
      return repos.systemEnums.listForOrg(orgId)
    })
    return { ok: true as const, data: values }
  } catch (error) {
    return { ok: false as const, error: toErrorResponse(error) }
  }
}

export async function createEnumValueAction(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  try {
    const orgId = formData.get('orgId') as string
    const registryKey = formData.get('registryKey') as string
    const value = formData.get('value') as string
    const label = formData.get('label') as string

    // Validate input
    const input = systemEnumValueInputSchema.parse({
      orgId,
      registryKey,
      value,
      label,
    })

    // Check authorization
    const session = await getCurrentSession()
    if (!session?.sub) {
      return { ok: false, error: 'Unauthorized' }
    }

    const provider = await getServerStorageProvider()
    const idGen = new UuidIdGenerator()
    const clock = new SystemClock()

    await provider.withTransaction(async (repos) => {
      // Verify owner membership
      await requireOwnerMembership(repos.organization, input.orgId, session.sub)

      // Add the value
      const enumService = new EnumRegistryService(repos.systemEnums)
      await enumService.addValue({
        id: idGen.next(),
        orgId: input.orgId,
        registryKey: input.registryKey,
        value: input.value,
        label: input.label,
        createdBy: session.sub,
        now: clock.now(),
      })
    })

    revalidatePath('/admin/enum-values')
    return { ok: true }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const fieldError = error.errors[0]
      return { ok: false, error: `${fieldError.path.join('.')}: ${fieldError.message}` }
    }
    return { ok: false, error: toErrorResponse(error).message }
  }
}

export async function deactivateEnumValueAction(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  try {
    const enumValueId = formData.get('enumValueId') as string
    const orgId = formData.get('orgId') as string

    if (!enumValueId || !orgId) {
      return { ok: false, error: 'Missing required fields' }
    }

    const session = await getCurrentSession()
    if (!session?.sub) {
      return { ok: false, error: 'Unauthorized' }
    }

    const provider = await getServerStorageProvider()
    const clock = new SystemClock()

    await provider.withTransaction(async (repos) => {
      // Verify owner membership
      await requireOwnerMembership(repos.organization, orgId, session.sub)

      // Find and update the value
      const value = await repos.systemEnums.findById(enumValueId)
      if (!value) {
        throw new Error('Enum value not found')
      }

      if (value.orgId !== orgId) {
        throw new Error('Org mismatch')
      }

      await repos.systemEnums.save({
        ...value,
        active: false,
        updatedAt: clock.now(),
      })
    })

    revalidatePath('/admin/enum-values')
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: toErrorResponse(error).message }
  }
}
