'use server'

import { z } from 'zod'
import { getCurrentSession } from '@domains/auth/actions/session'
import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { listAuditEntriesForOrg } from '@domains/audit/services/audit-service'
import { toErrorResponse } from '@shared/errors'
import type { AuditEntry } from '@domains/audit/entities/audit-entry'

const filterSchema = z.object({
  branchId: z.string().optional(),
  action: z.string().optional(),
  from: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  to: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
})

export type AuditListFilter = z.infer<typeof filterSchema>

export async function listAuditEntriesAction(filter?: AuditListFilter) {
  try {
    const session = await getCurrentSession()

    if (!session?.sub || !session.orgId) {
      return { ok: false, error: 'Unauthorized' }
    }

    const validatedFilter = filter ? filterSchema.parse(filter) : undefined

    const provider = await createDefaultStorageProvider()

    try {
      const entries = await provider.withTransaction(async (repos) => {
        return await listAuditEntriesForOrg(
          repos,
          session.orgId!,
          90, // Default retention of 90 days - TODO: get from settings
          { now: () => new Date() },
          validatedFilter,
        )
      })

      return { ok: true, data: entries }
    } finally {
      await provider.close()
    }
  } catch (error) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
