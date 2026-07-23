import { requireActiveBranch, requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { RouteError } from '@shared/components/ui/route-error'

export default async function CustomersPage() {
  const session = await requireSession()
  const branchId = await requireActiveBranch()

  try {
    const provider = await getServerStorageProvider()

    const { customers, roleContext } = await provider.withTransaction(async (repos) => {

      // Check role
      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Cashier cannot access customers list
      if (roleContext.isCashier) {
        return { customers: [], roleContext }
      }

      // Get customers
      const customers = await repos.customers.listByOrg(session.orgId!)

      return {
        customers: customers.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
        ),
        roleContext,
      }
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2xl font-display font-semibold text-foreground mb-2">
            Customers
          </h1>
          <p className="text-body text-foreground-muted">
            Manage customer information
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Loyalty Balance</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-foreground-muted">
                      No customers recorded
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium">{customer.firstName} {customer.lastName}</td>
                      <td className="px-4 py-3 text-foreground-muted text-label">{customer.phone || '—'}</td>
                      <td className="px-4 py-3 text-foreground-muted text-label">{customer.email || '—'}</td>
                      <td className="px-4 py-3 text-right text-foreground tabular-nums">
                        ${((customer.loyaltyPointsBalance || 0) / 100).toFixed(2)}
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
    console.error('Customers error:', error)
    return (
      <RouteError
        title="Failed to load customers"
        message="Unable to retrieve customer data. Your data on this device is safe."
        kind="system"
      />
    )
  }
}
