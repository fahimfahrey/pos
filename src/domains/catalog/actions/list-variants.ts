'use server'

import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { getCurrentSession } from '@domains/auth/actions/session'
import { requireAdminMembership } from '@domains/auth/services/authorization-service'
import { CatalogQueryService } from '../services/catalog-query-service'
import { toErrorResponse } from '@shared/errors'

export async function listVariantsAction(orgId: string, options: any = {}) {
  try {
    const session = await getCurrentSession()
    if (!session?.sub) {
      return { ok: false as const, error: 'Unauthorized' }
    }

    const provider = await getServerStorageProvider()

    const result = await provider.withTransaction(async (repos) => {
      await requireAdminMembership(repos.organization, orgId, session.sub)

      const service = new CatalogQueryService(repos.catalog)
      return service.listVariantsPage(orgId, {
        page: options.page,
        pageSize: options.pageSize,
        query: options.query,
        categoryId: options.categoryId,
      })
    })

    return { ok: true as const, data: result }
  } catch (error: any) {
    return { ok: false as const, error: toErrorResponse(error) }
  }
}
