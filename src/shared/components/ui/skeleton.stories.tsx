import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Rectangle: Story = {
  args: {
    className: 'h-12 w-48',
  },
}

export const Circle: Story = {
  args: {
    variant: 'circle',
    className: 'h-12 w-12',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
    className: 'h-4 w-full',
  },
}

export const CardSkeleton: Story = {
  render: () => (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-6 w-80">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  ),
}

export const DarkTheme: Story = {
  args: {
    className: 'h-12 w-48',
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    className: 'h-12 w-48',
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
