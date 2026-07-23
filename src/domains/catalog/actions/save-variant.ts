'use server'

import { revalidatePath } from 'next/cache'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { SystemClock } from '@infra/adapters/system-clock'
import { getCurrentSession } from '@domains/auth/actions/session'
import { requireAdminMembership } from '@domains/auth/services/authorization-service'
import { CatalogService } from '../services/catalog-service'
import { catalogEventBus } from '@infra/events/catalog-event-bus'
import { toErrorResponse } from '@shared/errors'

export async function saveVariantAction(
  prevState: any,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string; data?: any }> {
  try {
    const orgId = formData.get('orgId') as string
    const variantId = formData.get('variantId') as string | null
    const productId = formData.get('productId') as string
    const sku = formData.get('sku') as string
    const barcode = formData.get('barcode') as string
    const name = formData.get('name') as string
    const unitOfMeasure = formData.get('unitOfMeasure') as string
    const barcodeSymbology = formData.get('barcodeSymbology') as string
    const isDecimalQuantity = formData.get('isDecimalQuantity') === 'true'

    if (!orgId || !productId || !sku || !unitOfMeasure) {
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

      if (variantId) {
        // Update existing
        await service.updateVariant(variantId, {
          name: name || undefined,
          barcode: barcode || undefined,
          unitOfMeasure,
          isDecimalQuantity,
        })
      } else {
        // Create new
        await service.createVariant({
          orgId,
          productId,
          sku,
          barcode: barcode || undefined,
          name: name || undefined,
          unitOfMeasure,
          barcodeSymbology: barcodeSymbology || undefined,
          isDecimalQuantity,
        })
      }
    })

    revalidatePath('/app/catalog')
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: toErrorResponse(error) }
  }
}
