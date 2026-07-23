import { requireActiveBranch, requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { Badge } from '@shared/components/ui/badge'
import { RouteError } from '@shared/components/ui/route-error'

export default async function PurchasingPage() {
  const session = await requireSession()
  const branchId = await requireActiveBranch()

  try {
    const provider = await getServerStorageProvider()

    const { purchaseOrders, roleContext } = await provider.withTransaction(async (repos) => {

      // Check role
      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Cashier cannot access purchasing
      if (roleContext.isCashier) {
        return { purchaseOrders: [], roleContext }
      }

      // Get purchase orders for org (branch filtering would happen at domain level)
      const allPOs = await repos.purchasing.listPurchaseOrdersByOrg(session.orgId!)

      return {
        purchaseOrders: allPOs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        roleContext,
      }
    })

    function getStatusBadge(status: string) {
      switch (status) {
        case 'draft':
          return <Badge variant="secondary" className="text-label">Draft</Badge>
        case 'pending':
          return <Badge variant="warning" className="text-label">Pending</Badge>
        case 'received':
          return <Badge variant="success" className="text-label">Received</Badge>
        default:
          return <Badge className="text-label">{status}</Badge>
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2xl font-display font-semibold text-foreground mb-2">
            Purchasing
          </h1>
          <p className="text-body text-foreground-muted">
            Manage purchase orders
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">PO Number</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Supplier</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-foreground-muted">
                      No purchase orders
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b border-border hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium">{po.id}</td>
                      <td className="px-4 py-3 text-foreground">{po.supplierId}</td>
                      <td className="px-4 py-3">{getStatusBadge(po.status)}</td>
                      <td className="px-4 py-3 text-right text-foreground tabular-nums">
                        ${(po.total / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Purchasing error:', error)
    return (
      <RouteError
        title="Failed to load purchasing"
        message="Unable to retrieve purchasing data. Your data on this device is safe."
        kind="system"
      />
    )
  }
}
