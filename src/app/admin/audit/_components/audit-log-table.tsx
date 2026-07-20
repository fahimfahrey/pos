import type { AuditEntry } from '@domains/audit/entities/audit-entry'

interface AuditLogTableProps {
  entries: AuditEntry[]
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No audit entries found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-900">Timestamp</th>
            <th className="px-4 py-2 text-left font-medium text-gray-900">Actor</th>
            <th className="px-4 py-2 text-left font-medium text-gray-900">Action</th>
            <th className="px-4 py-2 text-left font-medium text-gray-900">Entity</th>
            <th className="px-4 py-2 text-left font-medium text-gray-900">Branch</th>
            <th className="px-4 py-2 text-left font-medium text-gray-900">Changes</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-900">
                {entry.createdAt.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-gray-900 font-mono text-xs">
                {entry.actorId}
              </td>
              <td className="px-4 py-2 text-gray-900">
                <span className="inline-block bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs font-medium">
                  {entry.action}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-900">
                <div className="text-sm">
                  <div className="font-semibold">{entry.entityType}</div>
                  <div className="text-gray-600 font-mono text-xs">{entry.entityId}</div>
                </div>
              </td>
              <td className="px-4 py-2 text-gray-900 text-sm">
                {entry.branchId || '—'}
              </td>
              <td className="px-4 py-2">
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  {entry.before && (
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">Before</div>
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-24">
                        {JSON.stringify(entry.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {entry.after && (
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">After</div>
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-24">
                        {JSON.stringify(entry.after, null, 2)}
                      </pre>
                    </div>
                  )}
                  {!entry.before && !entry.after && (
                    <div className="col-span-2 text-gray-500 text-sm italic">No changes recorded</div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
