import { requireActiveBranch, requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { Badge } from '@shared/components/ui/badge'
import { RouteError } from '@shared/components/ui/route-error'

export default async function InventoryPage() {
  const session = await requireSession()
  const branchId = await requireActiveBranch()

  try {
    const provider = await createDefaultStorageProvider()

    const { stockLevels, roleContext } = await provider.withTransaction(async (tx) => {
      const repos = await provider.getRepositorySet(tx)

      // Check role
      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Cashier cannot access inventory
      if (roleContext.isCashier) {
        return { stockLevels: [], roleContext }
      }

      // Get stock levels for branch
      const stockLevels = await repos.inventory.listStockLevelsByBranch(branchId)

      return {
        stockLevels: stockLevels.sort((a, b) => a.variantId.localeCompare(b.variantId)),
        roleContext,
      }
    })

    await provider.close()

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2xl font-display font-semibold text-foreground mb-2">
            Inventory
          </h1>
          <p className="text-body text-foreground-muted">
            Manage stock levels for this branch
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Variant ID</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Quantity</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Reorder Threshold</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-foreground-muted">
                      No stock levels recorded
                    </td>
                  </tr>
                ) : (
                  stockLevels.map((level) => {
                    const isLow = (level.reorderThreshold || 0) > 0 && level.quantity <= (level.reorderThreshold || 0)
                    return (
                      <tr key={level.id} className="border-b border-border hover:bg-surface-muted transition-colors">
                        <td className="px-4 py-3 text-foreground font-medium">{level.variantId}</td>
                        <td className="px-4 py-3 text-right text-foreground tabular-nums">{level.quantity}</td>
                        <td className="px-4 py-3 text-right text-foreground-muted tabular-nums text-label">
                          {level.reorderThreshold || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {isLow ? (
                            <Badge variant="warning" className="text-label">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-label">
                              In Stock
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Inventory error:', error)
    return (
      <RouteError
        title="Failed to load inventory"
        message="Unable to retrieve inventory data. Your data on this device is safe."
        kind="system"
      />
    )
  }
}
