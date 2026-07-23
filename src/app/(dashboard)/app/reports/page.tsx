import { requireActiveBranch, requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { RouteError } from '@shared/components/ui/route-error'
import { EmptyState } from '@shared/components/ui/empty-state'
import { ReportingService } from '@domains/reporting/services/reporting-service'
import { buildReportCsv } from '@domains/reporting/services/csv-export'
import type { ReportRange } from '@domains/reporting/entities/report-rows'
import { ReportsView, type ReportsData } from './reports-view'

function rangeLabel(from: Date, to: Date): string {
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return `${fmt(from)}_${fmt(to)}`
}

export default async function ReportsPage() {
  const session = await requireSession()
  const branchId = await requireActiveBranch()

  try {
    const provider = await getServerStorageProvider()

    const result = await provider.withTransaction(async (repos) => {

      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Register-bound cashiers don't get the back-office reports surface.
      if (!membership || roleContext.isCashier) {
        return { restricted: true as const, roleContext }
      }

      const branch = await repos.organization.findBranchById(branchId)
      const service = new ReportingService(repos.reporting, {
        organization: repos.organization,
        sales: repos.sales,
      })

      // Default window: trailing 30 days.
      const to = new Date()
      const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
      const range: ReportRange = { from, to }
      const timezone = 'UTC'
      const requested = { branchId }
      const m = { id: membership.id, role: membership.role, userId: membership.userId, status: membership.status }

      const [period, category, product, cashier, margin, tax, payment, heatmap] = await Promise.all([
        service.getSalesByPeriod(session.orgId!, m, range, 'day', timezone, requested),
        service.getSalesByCategory(session.orgId!, m, range, requested),
        service.getSalesByProduct(session.orgId!, m, range, requested),
        service.getSalesByCashier(session.orgId!, m, range, requested),
        service.getMarginByProduct(session.orgId!, m, range, requested),
        service.getTaxCollectedByRate(session.orgId!, m, range, requested),
        service.getPaymentMethodBreakdown(session.orgId!, m, range, requested),
        service.getHourlySalesHeatmap(session.orgId!, m, range, timezone, requested),
      ])

      const csv: Record<string, string> = {
        sales_period: buildReportCsv('sales_period', period),
        sales_category: buildReportCsv('sales_category', category),
        sales_product: buildReportCsv('sales_product', product),
        sales_cashier: buildReportCsv('sales_cashier', cashier),
        margin: buildReportCsv('margin', margin),
        tax: buildReportCsv('tax', tax),
        payment_method: buildReportCsv('payment_method', payment),
        hourly_heatmap: buildReportCsv('hourly_heatmap', heatmap),
      }

      const data: ReportsData = {
        rangeLabel: rangeLabel(from, to),
        period,
        category,
        product,
        cashier,
        margin,
        tax,
        payment,
        heatmap,
        csv,
        scope: {
          persona: roleContext.persona,
          branchLabel: branch?.name ?? 'This branch',
          canSeeCashiers: roleContext.isOwner || roleContext.isManager,
          canSeeMargin: roleContext.isOwner || roleContext.isManager,
        },
      }

      return { restricted: false as const, data }
    })

    if (result.restricted) {
      return (
        <div className="space-y-6">
          <PageHeader scope={null} />
          <EmptyState
            icon="🔒"
            title="Reports aren't available for your role"
            description="Sales reports and the register close are back-office surfaces. Ask an owner or manager for a copy."
          />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <PageHeader scope={result.data.scope} />
        <ReportsView data={result.data} />
      </div>
    )
  } catch (error) {
    console.error('Reports error:', error)
    return (
      <RouteError
        title="Failed to load reports"
        message="Unable to retrieve reporting data. Your data on this device is safe."
        kind="system"
      />
    )
  }
}

function PageHeader({ scope }: { scope: ReportsData['scope'] | null }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="mb-1 font-display text-display-2xl font-semibold text-foreground">Reports</h1>
        <p className="text-body text-foreground-muted">Sales, margins, tax and register activity — last 30 days.</p>
      </div>
      {scope && (
        <div className="flex items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface px-3 py-1.5 text-caption text-foreground-muted">
          <span aria-hidden>👁</span>
          <span>
            Scoped to <span className="font-medium text-foreground">{scope.branchLabel}</span> · {scope.persona}
          </span>
        </div>
      )}
    </div>
  )
}
