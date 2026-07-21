import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      options: ['default', 'success', 'danger', 'warning', 'secondary'],
      control: { type: 'radio' },
    },
    shape: {
      options: ['badge', 'pill'],
      control: { type: 'radio' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    shape: 'badge',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="secondary">Secondary</Badge>
    </div>
  ),
}

export const AllShapes: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge shape="badge">Badge</Badge>
      <Badge shape="pill">Pill</Badge>
    </div>
  ),
}

export const DarkTheme: Story = {
  args: {
    children: 'Dark Badge',
    variant: 'default',
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    children: 'ব্যাজ',
    variant: 'success',
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
