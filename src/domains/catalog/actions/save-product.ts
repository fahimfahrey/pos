'use server'

import { revalidatePath } from 'next/cache'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { SystemClock } from '@infra/adapters/system-clock'
import { getCurrentSession } from '@domains/auth/actions/session'
import { requireAdminMembership } from '@domains/auth/services/authorization-service'
import { CatalogService } from '../services/catalog-service'
import { catalogEventBus } from '@infra/events/catalog-event-bus'
import { productSchema } from '../schemas/catalog.schema'
import { toErrorResponse } from '@shared/errors'

export async function saveProductAction(
  prevState: any,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string; data?: any }> {
  try {
    const orgId = formData.get('orgId') as string
    const productId = formData.get('productId') as string | null
    const categoryId = formData.get('categoryId') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const imageFileId = formData.get('imageFileId') as string

    if (!orgId || !categoryId || !name) {
      return { ok: false, error: 'Missing required fields' }
    }

    const session = await getCurrentSession()
    if (!session?.sub) {
      return { ok: false, error: 'Unauthorized' }
    }

    const provider = await getServerStorageProvider()
    const idGen = new UuidIdGenerator()
    const clock = new SystemClock()

    await provider.withTransaction(async (repos) => {
      await requireAdminMembership(repos.organization, orgId, session.sub)

      const service = new CatalogService(repos.catalog, idGen, clock, catalogEventBus)

      if (productId) {
        // Update existing
        await service.updateProduct(productId, {
          name,
          description: description || undefined,
          imageFileId: imageFileId || undefined,
          categoryId,
        })
      } else {
        // Create new
        await service.createProduct({
          orgId,
          categoryId,
          name,
          description: description || undefined,
          imageFileId: imageFileId || undefined,
        })
      }
    })

    revalidatePath('/app/catalog')
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
