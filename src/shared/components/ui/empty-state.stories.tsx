import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './empty-state'
import { Button } from './button'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    icon: '📭',
    title: 'No results',
    description: 'Try adjusting your search filters',
  },
}

export const WithAction: Story = {
  args: {
    icon: '🎉',
    title: 'Ready to get started?',
    description: 'Create your first item to begin',
    action: <Button>Create item</Button>,
  },
}

export const NotFound: Story = {
  args: {
    icon: '🔍',
    title: 'Nothing found',
    description: 'We could not find what you were looking for',
  },
}

export const Error: Story = {
  args: {
    icon: '⚠️',
    title: 'Something went wrong',
    description: 'Please try again later',
    action: <Button variant="secondary">Retry</Button>,
  },
}

export const DarkTheme: Story = {
  args: {
    icon: '📭',
    title: 'No results',
    description: 'Try adjusting your search filters',
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    icon: '📭',
    title: 'কোন ফলাফল নেই',
    description: 'আপনার অনুসন্ধান ফিল্টার সামঞ্জস্য করার চেষ্টা করুন',
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
