import { redirect } from 'next/navigation'
import { getCurrentSession } from '@domains/auth/actions/session'
import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { Card, CardContent } from '@shared/components/ui/card'
import { EmptyState } from '@shared/components/ui/empty-state'
import { RouteError } from '@shared/components/ui/route-error'

export default async function DashboardPage() {
  const session = await getCurrentSession()

  if (!session?.sub) {
    redirect('/login')
  }

  if (!session.branchId) {
    redirect('/app')
  }

  try {
    const provider = await createDefaultStorageProvider()
    let todaysSales = 0
    let orderCount = 0
    let recentOrders: Array<{ id: string; total: number; createdAt: Date }> = []

    await provider.withTransaction(async (tx) => {
      const repos = await provider.getRepositorySet(tx)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const sales = await repos.sales.listSalesByBranch(session.branchId!, 100)

      // Filter to today's sales
      const todaysSalesFiltered = sales.filter((s) => {
        const saleDate = new Date(s.createdAt)
        saleDate.setHours(0, 0, 0, 0)
        return saleDate.getTime() === today.getTime()
      })

      // Calculate today's total
      todaysSales = todaysSalesFiltered.reduce((sum, s) => sum + s.total, 0)
      orderCount = todaysSalesFiltered.length

      // Get 5 most recent
      recentOrders = todaysSalesFiltered
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((s) => ({ id: s.id, total: s.total, createdAt: s.createdAt }))
    })

    await provider.close()

    const formatMoney = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-foreground-muted">Welcome to your POS system dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-2">Today's Sales</h2>
              <p className="text-3xl font-bold text-accent">{formatMoney(todaysSales)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
              <p className="text-3xl font-bold text-foreground">{orderCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <EmptyState
                title="No sales yet"
                description="Completed sales will show up here"
                headingLevel="h3"
              />
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 rounded border border-border">
                    <span className="text-sm text-foreground-muted">{order.id}</span>
                    <span className="font-semibold text-foreground">{formatMoney(order.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
