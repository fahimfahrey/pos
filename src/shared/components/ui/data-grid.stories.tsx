import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DataGrid, type Column } from './data-grid'

const meta: Meta<typeof DataGrid> = {
  title: 'Components/DataGrid',
  component: DataGrid,
}

export default meta
type Story = StoryObj<typeof DataGrid>

interface Product {
  id: string
  name: string
  price: number
  quantity: number
}

const SAMPLE_DATA: Product[] = [
  { id: '1', name: 'Widget A', price: 29.99, quantity: 10 },
  { id: '2', name: 'Widget B', price: 49.99, quantity: 5 },
  { id: '3', name: 'Widget C', price: 19.99, quantity: 20 },
]

const COLUMNS: Column<Product>[] = [
  { id: 'name', header: 'Product Name', accessor: 'name', sortable: true },
  { id: 'price', header: 'Price', accessor: 'price', sortable: true, className: 'text-right tabular-nums' },
  { id: 'quantity', header: 'Quantity', accessor: 'quantity', sortable: true, className: 'text-right tabular-nums' },
]

export const Default: Story = {
  render: () => {
    const [sortColumn, setSortColumn] = useState<string>()
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortColumn(column)
        setSortDirection('asc')
      }
    }

    return (
      <DataGrid
        columns={COLUMNS}
        data={SAMPLE_DATA}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        keyExtractor={(item) => item.id}
      />
    )
  },
}

export const Loading: Story = {
  render: () => <DataGrid columns={COLUMNS} data={[]} loading={true} keyExtractor={(item) => item.id} />,
}

export const Empty: Story = {
  render: () => <DataGrid columns={COLUMNS} data={[]} empty={true} emptyMessage="No products found" />,
}

export const DarkTheme: Story = {
  render: () => (
    <DataGrid
      columns={COLUMNS}
      data={SAMPLE_DATA}
      keyExtractor={(item) => item.id}
    />
  ),
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => {
    const bengaliColumns: Column<Product>[] = [
      { id: 'name', header: 'পণ্যের নাম', accessor: 'name', sortable: true },
      { id: 'price', header: 'মূল্য', accessor: 'price', sortable: true, className: 'text-right tabular-nums' },
      { id: 'quantity', header: 'পরিমাণ', accessor: 'quantity', sortable: true, className: 'text-right tabular-nums' },
    ]

    return (
      <DataGrid
        columns={bengaliColumns}
        data={SAMPLE_DATA}
        keyExtractor={(item) => item.id}
      />
    )
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
