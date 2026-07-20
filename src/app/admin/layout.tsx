import { requireSession } from '@domains/auth/actions/session'
import LogoutButton from '@app/_components/logout-button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession()

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
