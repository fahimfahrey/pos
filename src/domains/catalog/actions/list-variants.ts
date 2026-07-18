'use server'

import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { getCurrentSession } from '@domains/auth/actions/session'
import { requireAdminMembership } from '@domains/auth/services/authorization-service'
import { CatalogQueryService } from '../services/catalog-query-service'
import { toErrorResponse } from '@shared/errors'

export async function listVariantsAction(orgId: string, options: any = {}) {
  try {
    const session = await getCurrentSession()
    if (!session?.userId) {
      return { ok: false as const, error: 'Unauthorized' }
    }

    const provider = await createDefaultStorageProvider()

    try {
      const result = await provider.withTransaction(async (repos) => {
        await requireAdminMembership(repos.organization, orgId, session.userId)

        const service = new CatalogQueryService(repos.catalog)
        return service.listVariantsPage(orgId, {
          page: options.page,
          pageSize: options.pageSize,
          query: options.query,
          categoryId: options.categoryId,
        })
      })

      return { ok: true as const, data: result }
    } finally {
      await provider.close()
    }
  } catch (error: any) {
    return { ok: false as const, error: toErrorResponse(error) }
  }
}
