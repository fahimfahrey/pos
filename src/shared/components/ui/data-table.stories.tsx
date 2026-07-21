import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, type ColumnDef } from './data-table'

interface SampleRow {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
}

const sampleData: SampleRow[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'active' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', status: 'inactive' },
  { id: '4', name: 'David Brown', email: 'david@example.com', status: 'active' },
  { id: '5', name: 'Emma Davis', email: 'emma@example.com', status: 'inactive' },
]

const columns: ColumnDef<SampleRow>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    render: (value) => (value === 'active' ? '✓ Active' : '○ Inactive'),
  },
]

const meta = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
    keyExtractor: (row) => row.id,
  },
}

export const Loading: Story = {
  args: {
    columns,
    data: [],
    keyExtractor: (row) => row.id,
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    columns,
    data: [],
    keyExtractor: (row) => row.id,
    empty: true,
    emptyMessage: 'No records found',
  },
}

export const WithSelection: Story = {
  args: {
    columns,
    data: sampleData,
    keyExtractor: (row) => row.id,
    selectable: true,
  },
}

export const WithSorting: Story = {
  args: {
    columns,
    data: sampleData,
    keyExtractor: (row) => row.id,
  },
}
