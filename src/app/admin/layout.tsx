import { requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import LogoutButton from '@app/_components/logout-button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  // Gate admin access to owner and manager personas only
  const provider = await getServerStorageProvider()
  await provider.withTransaction(async (tx) => {
    const repos = await provider.getRepositorySet(tx)
    const membership = await repos.organization.findMembership(session.orgId!, session.sub)
    const roleContext = resolveRoleContext(session, membership)

    if (!roleContext.isOwner && !roleContext.isManager) {
      const { redirect } = await import('next/navigation')
      redirect('/app')
    }
  })
  await provider.close()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="flex gap-6 items-center">
            <a href="/admin" className="text-gray-700 hover:text-gray-900">
              Home
            </a>
            <a href="/admin/enum-values" className="text-gray-700 hover:text-gray-900">
              Enum Values
            </a>
            <a href="/admin/audit" className="text-gray-700 hover:text-gray-900">
              Audit Log
            </a>
          </div>
          <div className="flex gap-4 items-center">
            <a href="/app" className="text-blue-600 hover:underline">
              Back to Dashboard
            </a>
            <LogoutButton />
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  )
}
