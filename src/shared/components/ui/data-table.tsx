'use client'

import React, { useMemo, useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@shared/utils/cn'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './table'
import { Checkbox } from './checkbox'
import { Button } from './button'
import { Skeleton } from './skeleton'
import { EmptyState } from './empty-state'

export interface ColumnDef<T> {
  id: string
  header: string
  accessor: keyof T
  sortable?: boolean
  filterable?: 'text' | 'select'
  filterOptions?: Array<{ value: string; label: string }>
  width?: string
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  onRowActivate?: (row: T, id: string) => void
  selectable?: boolean
  onSelectionChange?: (selectedIds: Set<string>) => void
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  onRowActivate,
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Keyboard navigation state
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Sorting
  const currentSort = searchParams.get('sort')
  const currentDir = (searchParams.get('dir') as 'asc' | 'desc') || 'asc'

  const handleSort = useCallback(
    (columnId: string) => {
      const params = new URLSearchParams(searchParams)
      if (currentSort === columnId) {
        params.set('dir', currentDir === 'asc' ? 'desc' : 'asc')
      } else {
        params.set('sort', columnId)
        params.set('dir', 'asc')
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [currentSort, currentDir, searchParams, router]
  )

  const sortedData = useMemo(() => {
    if (!currentSort) return data
    const column = columns.find((c) => c.id === currentSort)
    if (!column) return data

    return [...data].sort((a, b) => {
      const aVal = a[column.accessor]
      const bVal = b[column.accessor]

      if (aVal < bVal) return currentDir === 'asc' ? -1 : 1
      if (aVal > bVal) return currentDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, columns, currentSort, currentDir])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableElement>) => {
      const { row, col } = focusedCell
      const maxRow = sortedData.length
      const maxCol = columns.length + (selectable ? 1 : 0)

      let newRow = row
      let newCol = col

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          newRow = Math.min(row + 1, maxRow - 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          newRow = Math.max(row - 1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          newCol = Math.min(col + 1, maxCol - 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          newCol = Math.max(col - 1, 0)
          break
        case 'Home':
          e.preventDefault()
          newCol = 0
          break
        case 'End':
          e.preventDefault()
          newCol = maxCol - 1
          break
        case ' ':
          e.preventDefault()
          if (selectable && col === 0) {
            const rowId = keyExtractor(sortedData[row], row)
            const newSelected = new Set(selectedIds)
            if (newSelected.has(rowId)) {
              newSelected.delete(rowId)
            } else {
              newSelected.add(rowId)
            }
            setSelectedIds(newSelected)
            onSelectionChange?.(newSelected)
          }
          break
        case 'Enter':
          e.preventDefault()
          if (onRowActivate) {
            onRowActivate(sortedData[row], keyExtractor(sortedData[row], row))
          }
          break
      }

      if (newRow !== row || newCol !== col) {
        setFocusedCell({ row: newRow, col: newCol })
      }
    },
    [focusedCell, sortedData, columns, selectable, keyExtractor, selectedIds, onSelectionChange, onRowActivate]
  )

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedData.length) {
      setSelectedIds(new Set())
      onSelectionChange?.(new Set())
    } else {
      const allIds = new Set(sortedData.map((item, idx) => keyExtractor(item, idx)))
      setSelectedIds(allIds)
      onSelectionChange?.(allIds)
    }
  }, [selectedIds, sortedData, keyExtractor, onSelectionChange])

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && <TableHead className="w-12" />}
            {columns.map((col) => (
              <TableHead key={col.id}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {selectable && (
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              )}
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

  if (empty || sortedData.length === 0) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <Table onKeyDown={handleKeyDown} className="w-full">
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === sortedData.length && sortedData.length > 0}
                indeterminate={selectedIds.size > 0 && selectedIds.size < sortedData.length}
                onChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
          )}
          {columns.map((col, colIdx) => {
            const isActive = focusedCell.row === -1 && focusedCell.col === colIdx + (selectable ? 1 : 0)
            return (
              <TableHead
                key={col.id}
                className={cn(
                  'relative',
                  isActive && 'bg-accent/10',
                  col.sortable && 'cursor-pointer select-none'
                )}
                onClick={() => col.sortable && handleSort(col.id)}
              >
                {col.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-0"
                    tabIndex={isActive ? 0 : -1}
                  >
                    {col.header}
                    {currentSort === col.id && (
                      <span>{currentDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </Button>
                ) : (
                  col.header
                )}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item, rowIdx) => {
          const rowId = keyExtractor(item, rowIdx)
          const isRowSelected = selectedIds.has(rowId)

          return (
            <TableRow
              key={rowId}
              className={cn(
                'cursor-pointer',
                focusedCell.row === rowIdx && 'bg-accent/10',
                isRowSelected && 'bg-accent/5'
              )}
              tabIndex={focusedCell.row === rowIdx ? 0 : -1}
            >
              {selectable && (
                <TableCell className="w-12">
                  <Checkbox
                    checked={isRowSelected}
                    onChange={(checked) => {
                      const newSelected = new Set(selectedIds)
                      if (checked) {
                        newSelected.add(rowId)
                      } else {
                        newSelected.delete(rowId)
                      }
                      setSelectedIds(newSelected)
                      onSelectionChange?.(newSelected)
                    }}
                  />
                </TableCell>
              )}
              {columns.map((col, colIdx) => {
                const isActive = focusedCell.row === rowIdx && focusedCell.col === colIdx + (selectable ? 1 : 0)
                return (
                  <TableCell
                    key={col.id}
                    className={cn(
                      'relative',
                      isActive && 'ring-2 ring-accent ring-inset'
                    )}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {col.render
                      ? col.render(item[col.accessor], item)
                      : String(item[col.accessor] ?? '')}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export type { DataTableProps }
