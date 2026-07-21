'use client'

import * as React from 'react'
import { Button } from './button'
import { Skeleton } from './skeleton'
import { EmptyState } from './empty-state'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './table'
import { cn } from '@shared/utils/cn'

interface Column<T> {
  id: string
  header: string
  accessor: keyof T
  sortable?: boolean
  className?: string
}

interface DataGridProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string) => void
  keyExtractor?: (item: T, index: number) => string | number
}

function DataGrid<T>({
  columns,
  data,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  sortColumn,
  sortDirection,
  onSort,
  keyExtractor,
}: DataGridProps<T>) {
  const getRowKey = (item: T, index: number) => {
    if (keyExtractor) return keyExtractor(item, index)
    if (typeof item === 'object' && item !== null && 'id' in item) return (item as any).id
    return index
  }

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (empty || data.length === 0) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.id}
              className={col.className}
              onClick={() => col.sortable && onSort?.(col.id)}
            >
              {col.sortable ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 px-0"
                  aria-sort={
                    sortColumn === col.id
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  {col.header}
                  {sortColumn === col.id && (
                    <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </Button>
              ) : (
                col.header
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={getRowKey(item, index)}>
            {columns.map((col) => (
              <TableCell key={col.id} className={col.className}>
                {String((item as any)[col.accessor] ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { DataGrid }
export type { DataGridProps, Column }
