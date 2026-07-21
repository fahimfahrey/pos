'use client'

import { Skeleton } from '@shared/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="h-14 bg-surface border-b border-border px-4 flex items-center">
        <Skeleton className="h-6 w-48 rounded" />
      </div>
      <div className="flex-1 p-8">
        <Skeleton className="h-10 w-64 rounded mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded" />
          <Skeleton className="h-20 w-full rounded" />
          <Skeleton className="h-20 w-full rounded" />
        </div>
      </div>
    </div>
  )
}
