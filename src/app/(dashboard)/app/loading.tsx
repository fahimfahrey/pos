'use client'

import { SkeletonRows } from '@shared/components/ui/skeleton-rows'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-10 w-48 rounded bg-foreground-muted animate-pulse mb-2" />
        <div className="h-6 w-64 rounded bg-foreground-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border p-6 bg-surface">
            <div className="h-6 w-32 rounded bg-foreground-muted animate-pulse mb-4" />
            <div className="h-10 w-48 rounded bg-foreground-muted animate-pulse" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border p-6 bg-surface">
        <div className="h-6 w-32 rounded bg-foreground-muted animate-pulse mb-4" />
        <SkeletonRows rows={5} columns={2} variant="table" />
      </div>
    </div>
  )
}
