import { redirect } from 'next/navigation'
import { getCurrentSession } from '@domains/auth/actions/session'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { requireOwnerMembership } from '@domains/auth/services/authorization-service'
import { listEnumValues } from '@domains/system-enums/actions/enum-values'
import { CreateEnumValueForm } from './_components/create-enum-value-form'
import { EnumValuesTable } from './_components/enum-values-table'

export default async function EnumValuesPage() {
  const session = await getCurrentSession()

  if (!session?.sub) {
    redirect('/login')
  }

  if (!session.orgId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Enum Values</h1>
        <p className="text-gray-600">No organization selected. Please select an organization first.</p>
      </div>
    )
  }

  // Check OWNER membership at page render time (server-side gating for UX)
  const provider = await getServerStorageProvider()
  let isOwner = false

  await provider.withTransaction(async (repos) => {
    try {
      await requireOwnerMembership(repos.organization, session.orgId!, session.sub)
      isOwner = true
    } catch {
      isOwner = false
    }
  })

  if (!isOwner) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Enum Values</h1>
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <h2 className="font-semibold text-yellow-900 mb-2">Owners Only</h2>
          <p className="text-yellow-700">Only organization owners can manage enum values.</p>
        </div>
      </div>
    )
  }

  // Fetch enum values
  const result = await listEnumValues(session.orgId)
  const values = result.ok ? result.data : []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Enum Values</h1>

      <div className="grid gap-6">
        {/* Create Form */}
        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add Custom Value</h2>
          <CreateEnumValueForm orgId={session.orgId} />
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Current Values</h2>
          <EnumValuesTable orgId={session.orgId} values={values} />
        </div>
      </div>
    </div>
  )
}
