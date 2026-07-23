import { notFound } from 'next/navigation'
import { createStorageProvider } from '@infra/storage'
import { buildReceiptDocument } from '@domains/receipts/services/receipt-builder'
import { resolveSettings } from '@domains/organization/services/settings-resolver'
import { ReceiptView } from './_components/receipt-view'
import { ReceiptActions } from './_components/receipt-actions'

interface ReceiptPageProps {
  params: Promise<{ saleId: string }>
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { saleId } = await params

  // Initialize storage provider
  const provider = await createStorageProvider({ engine: 'indexeddb' })

  // Load sale and related data
  let sale
  let items
  let payments
  let org
  let branch
  let settings

  try {
    await provider.withTransaction(async (repos) => {
      // Load sale
      sale = await repos.sales.findSaleById(saleId)
      if (!sale) {
        notFound()
      }

      // Load sale items
      items = await repos.sales.listSaleItems(saleId)

      // Load payments
      payments = await repos.payments.listPaymentsForSale(saleId)

      // Load org and branch
      org = await repos.organization.findOrganizationById(sale.orgId)
      branch = await repos.organization.findBranchById(sale.branchId)

      if (!org || !branch) {
        notFound()
      }

      // Resolve settings
      settings = resolveSettings({ settings: org.settings }, { settings: branch.settings })
    })
  } catch (error) {
    console.error('Failed to load receipt data:', error)
    notFound()
  }

  if (!sale || !items || !payments || !org || !branch || !settings) {
    notFound()
  }

  // Build receipt document
  const document = buildReceiptDocument({
    sale,
    items,
    payments,
    org,
    branch,
    settings,
  })

  return (
    <div>
      <ReceiptView document={document} />
      <ReceiptActions document={document} />
    </div>
  )
}
