'use client'

import * as React from 'react'
import { Skeleton } from './skeleton'
import { cn } from '@shared/utils/cn'

interface SkeletonRowsProps extends React.HTMLAttributes<HTMLDivElement> {
  rows: number
  columns: number
  variant?: 'table' | 'grid' | 'list'
}

const SkeletonRows = React.forwardRef<HTMLDivElement, SkeletonRowsProps>(
  ({ className, rows = 3, columns = 3, variant = 'table', ...props }, ref) => {
    if (variant === 'table') {
      return (
        <div ref={ref} className={cn('space-y-3', className)} {...props}>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-3">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className={cn('h-8 rounded', colIndex === 0 ? 'flex-1' : 'flex-1')} />
              ))}
            </div>
          ))}
        </div>
      )
    }

    if (variant === 'grid') {
      return (
        <div
          ref={ref}
          className={cn(`grid gap-4`, columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : `grid-cols-${columns}`, className)}
          {...props}
        >
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-border p-4 bg-surface">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      )
    }

    // list variant
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    )
  }
)

SkeletonRows.displayName = 'SkeletonRows'

export { SkeletonRows }
