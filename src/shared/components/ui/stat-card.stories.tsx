import type { Meta, StoryObj } from '@storybook/react'
import { StatCard } from './stat-card'

const meta = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: "Today's Sales",
    value: '$1,234.56',
    delta: {
      label: '+12.3%',
      variant: 'positive',
    },
  },
}

export const WithCTA: Story = {
  args: {
    title: 'Low Stock Items',
    value: '5 products',
    delta: {
      label: '-2 since yesterday',
      variant: 'positive',
    },
    cta: {
      label: 'View inventory',
      href: '/app/inventory',
    },
  },
}

export const NegativeDelta: Story = {
  args: {
    title: 'Open Shifts',
    value: '3',
    delta: {
      label: '-1 from yesterday',
      variant: 'negative',
    },
  },
}

export const Loading: Story = {
  args: {
    title: "Today's Sales",
    value: '$0.00',
    loading: true,
  },
}

export const Simple: Story = {
  args: {
    title: 'Total Orders',
    value: '42',
  },
}
