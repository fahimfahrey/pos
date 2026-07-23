import { requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { RouteError } from '@shared/components/ui/route-error'
import { EmptyState } from '@shared/components/ui/empty-state'
import { ZReportDocument, type ZReportLabels } from '@shared/components/reports/z-report-document'
import type { ZReport } from '@domains/reporting/entities/z-report'

export default async function ZReportPage({ params }: { params: Promise<{ shiftId: string }> }) {
  const { shiftId } = await params
  const session = await requireSession()

  try {
    const provider = await getServerStorageProvider()

    const result = await provider.withTransaction(async (repos) => {

      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)
      const report = await repos.reporting.findZReportByShift(shiftId)

      if (!report) return { report: null as ZReport | null, labels: {} as ZReportLabels, allowed: true }

      // Back-office roles may view any close; a cashier may view only their own.
      const allowed =
        roleContext.isOwner ||
        roleContext.isManager ||
        roleContext.isAuditor ||
        report.cashierUserId === session.sub

      if (!allowed) return { report, labels: {} as ZReportLabels, allowed: false }

      const [org, branch, register, cashier] = await Promise.all([
        repos.organization.findOrganizationById(report.orgId),
        repos.organization.findBranchById(report.branchId),
        repos.organization.findRegisterById(report.registerId),
        repos.auth.findUserById(report.cashierUserId),
      ])

      const labels: ZReportLabels = {
        businessName: org?.name,
        branchName: branch?.name,
        registerName: register?.name,
        cashierName: cashier?.username,
      }

      return { report, labels, allowed: true }
    })

    if (!result.allowed) {
      return (
        <EmptyState
          icon="🔒"
          title="You can't view this close"
          description="This Z-report belongs to another cashier's shift."
        />
      )
    }

    if (!result.report) {
      return (
        <EmptyState
          icon="🧾"
          title="No close for this shift"
          description="A Z-report is generated when the shift is closed and the drawer is counted."
        />
      )
    }

    return (
      <div className="py-2">
        <ZReportDocument report={result.report} labels={result.labels} />
      </div>
    )
  } catch (error) {
    console.error('Z-report error:', error)
    return (
      <RouteError
        title="Failed to load Z-report"
        message="Unable to retrieve the register close. Your data on this device is safe."
        kind="system"
      />
    )
  }
}
