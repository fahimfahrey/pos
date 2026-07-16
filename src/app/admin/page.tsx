export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage system settings and users</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">System Information</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Version:</span> 0.1.0
          </p>
          <p>
            <span className="font-medium">Environment:</span> Development
          </p>
          <p>
            <span className="font-medium">Database:</span> IndexedDB
          </p>
        </div>
      </div>
    </div>
  )
}
