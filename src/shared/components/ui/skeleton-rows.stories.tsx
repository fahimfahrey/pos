import type { Meta, StoryObj } from '@storybook/react'
import { SkeletonRows } from './skeleton-rows'

const meta: Meta<typeof SkeletonRows> = {
  title: 'Components/SkeletonRows',
  component: SkeletonRows,
}

export default meta
type Story = StoryObj<typeof SkeletonRows>

export const TableLayout: Story = {
  args: {
    rows: 5,
    columns: 4,
    variant: 'table',
  },
}

export const GridLayout: Story = {
  args: {
    rows: 6,
    columns: 3,
    variant: 'grid',
  },
}

export const ListLayout: Story = {
  args: {
    rows: 4,
    columns: 1,
    variant: 'list',
  },
}

export const AuditTableSkeleton: Story = {
  args: {
    rows: 6,
    columns: 6,
    variant: 'table',
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Audit Log Loading...</h2>
        <Story />
      </div>
    ),
  ],
}

export const DashboardStatsSkeleton: Story = {
  args: {
    rows: 3,
    columns: 3,
    variant: 'grid',
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Dashboard Loading...</h2>
        <Story />
      </div>
    ),
  ],
}

export const ReceiptLineItemsSkeleton: Story = {
  args: {
    rows: 8,
    columns: 3,
    variant: 'table',
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Receipt Loading...</h2>
        <Story />
      </div>
    ),
  ],
}

export const DarkTheme: Story = {
  args: {
    rows: 4,
    columns: 4,
    variant: 'table',
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkGridTheme: Story = {
  args: {
    rows: 6,
    columns: 3,
    variant: 'grid',
  },
  parameters: {
    theme: 'dark',
  },
}
