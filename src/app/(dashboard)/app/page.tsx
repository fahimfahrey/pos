import { requireActiveBranch, requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { StatCard } from '@shared/components/ui/stat-card'
import { RouteError } from '@shared/components/ui/route-error'

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default async function DashboardPage() {
  const session = await requireSession()
  const branchId = await requireActiveBranch()

  try {
    const provider = await getServerStorageProvider()

    const {
      todaysSales,
      todayOrderCount,
      lowStockCount,
      openShiftCount,
      recentActivities,
      roleContext,
    } = await provider.withTransaction(async (repos) => {

      // Get role context
      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Today's sales
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sales = await repos.sales.listSalesByBranch(branchId, 100)
      const todaysSalesFiltered = sales.filter((s) => {
        const saleDate = new Date(s.createdAt)
        saleDate.setHours(0, 0, 0, 0)
        return saleDate.getTime() === today.getTime()
      })
      const todaysSales = todaysSalesFiltered.reduce((sum, s) => sum + s.total, 0)
      const todayOrderCount = todaysSalesFiltered.length

      // Low stock
      const lowStockItems = await repos.inventory.listLowStock(branchId)
      const lowStockCount = lowStockItems.length

      // Open shifts
      const shifts = await repos.sales.listShiftsByBranch(branchId)
      const openShiftCount = shifts.filter((s) => s.status === 'open').length

      // Recent activity (org-wide, but branch-filtered)
      const allAuditEntries = await repos.audit.listByOrg(session.orgId!)
      const recentActivities = allAuditEntries
        .filter((e) => e.branchId === branchId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)

      return {
        todaysSales,
        todayOrderCount,
        lowStockCount,
        openShiftCount,
        recentActivities,
        roleContext,
      }
    })

    return (
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-display-2xl font-display font-semibold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-body text-foreground-muted">
            Welcome to your POS system dashboard
          </p>
        </div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Sales */}
          <StatCard
            title="Today's Sales"
            value={formatMoney(todaysSales)}
            delta={
              todayOrderCount > 0
                ? {
                    label: `${todayOrderCount} ${todayOrderCount === 1 ? 'order' : 'orders'}`,
                    variant: 'positive',
                  }
                : undefined
            }
          />

          {/* Low Stock */}
          {(roleContext.isOwner || roleContext.isManager) && (
            <StatCard
              title="Low Stock Items"
              value={String(lowStockCount)}
              delta={
                lowStockCount > 0
                  ? {
                      label: lowStockCount === 1 ? '1 item' : `${lowStockCount} items`,
                      variant: 'negative',
                    }
                  : undefined
              }
              cta={
                lowStockCount > 0
                  ? {
                      label: 'View inventory →',
                      href: '/app/inventory',
                    }
                  : undefined
              }
            />
          )}

          {/* Open Shifts */}
          {(roleContext.isOwner || roleContext.isManager || roleContext.isCashier) && (
            <StatCard
              title="Open Shifts"
              value={String(openShiftCount)}
              delta={
                openShiftCount > 0
                  ? {
                      label: openShiftCount === 1 ? '1 shift' : `${openShiftCount} shifts`,
                      variant: 'positive',
                    }
                  : undefined
              }
            />
          )}

          {/* Recent Activity */}
          <StatCard
            title="Recent Activity"
            value={String(recentActivities.length)}
            delta={
              recentActivities.length > 0
                ? {
                    label: `${recentActivities.length} ${recentActivities.length === 1 ? 'event' : 'events'}`,
                    variant: 'neutral',
                  }
                : undefined
            }
            cta={
              roleContext.isOwner || roleContext.isAuditor
                ? {
                    label: 'View audit log →',
                    href: '/admin/audit',
                  }
                : undefined
            }
          />
        </div>

        {/* Recent Activity List */}
        {recentActivities.length > 0 && (
          <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)] px-6 py-4">
            <h2 className="text-display-lg font-display font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-3 rounded border border-border hover:bg-surface-muted transition-colors text-body"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium">
                      {activity.action} - {activity.entityType}
                    </p>
                    <p className="text-label text-foreground-muted">
                      {new Date(activity.createdAt).toLocaleTimeString()} •{' '}
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <RouteError
        title="Failed to load dashboard"
        message="Unable to retrieve dashboard data. Your data on this device is safe."
        kind="system"
      />
    )
  }
}
