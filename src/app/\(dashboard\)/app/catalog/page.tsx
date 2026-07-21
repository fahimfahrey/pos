import { requireActiveBranch, requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { RouteError } from '@shared/components/ui/route-error'

export default async function CatalogPage() {
  const session = await requireSession()
  const branchId = await requireActiveBranch()

  try {
    const provider = await createDefaultStorageProvider()

    const { products, roleContext } = await provider.withTransaction(async (tx) => {
      const repos = await provider.getRepositorySet(tx)

      // Check role
      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Cashier cannot access catalog
      if (roleContext.isCashier) {
        return { products: [], roleContext }
      }

      // Get products
      const products = await repos.catalog.listProductsByOrg(session.orgId!)

      return {
        products,
        roleContext,
      }
    })

    await provider.close()

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2xl font-display font-semibold text-foreground mb-2">
            Catalog
          </h1>
          <p className="text-body text-foreground-muted">
            Manage your product catalog
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Product Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-foreground-muted">
                      No products in catalog
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-background transition-colors">
                      <td className="px-4 py-3 text-foreground">{product.name}</td>
                      <td className="px-4 py-3 text-foreground-muted text-label">{product.id}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-label font-semibold bg-success text-white">
                          Active
                        </span>
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
    console.error('Catalog error:', error)
    return (
      <RouteError
        title="Failed to load catalog"
        message="Unable to retrieve catalog data. Your data on this device is safe."
        kind="system"
      />
    )
  }
}
