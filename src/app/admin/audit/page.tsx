import { redirect } from 'next/navigation'
import { getCurrentSession } from '@domains/auth/actions/session'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { listAuditEntriesAction } from '@domains/audit/actions/list-audit-entries'
import { MEMBERSHIP_ROLE } from '@constants/enums'
import { AuditLogTable } from './_components/audit-log-table'

export default async function AuditPage() {
  const session = await getCurrentSession()

  if (!session?.sub) {
    redirect('/login')
  }

  if (!session.orgId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
        <p className="text-gray-600">No organization selected. Please select an organization first.</p>
      </div>
    )
  }

  // Check membership role - allow OWNER and VIEWER (and possibly ADMIN)
  const provider = await getServerStorageProvider()
  let hasAccess = false

  await provider.withTransaction(async (repos) => {
    const membership = await repos.organization.findMembership(session.orgId!, session.sub)
    if (membership && (membership.role === MEMBERSHIP_ROLE.OWNER || membership.role === MEMBERSHIP_ROLE.ADMIN || membership.role === MEMBERSHIP_ROLE.VIEWER)) {
      hasAccess = true
    }
  })

  if (!hasAccess) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <h2 className="font-semibold text-yellow-900 mb-2">Owners and Auditors Only</h2>
          <p className="text-yellow-700">Only organization owners and auditors can view the audit log.</p>
        </div>
      </div>
    )
  }

  // Fetch audit entries
  const result = await listAuditEntriesAction()
  const entries = (result.ok ? result.data : undefined) || []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>

      <div className="rounded-lg bg-white shadow p-6">
        <AuditLogTable entries={entries} />
      </div>
    </div>
  )
}
