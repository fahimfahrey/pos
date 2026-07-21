import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'destructive', 'ghost', 'link'],
      control: { type: 'radio' },
    },
    size: {
      options: ['sm', 'md', 'lg', 'register'],
      control: { type: 'radio' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    iconOnly: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Click me',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    size: 'md',
    children: 'Delete',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    size: 'md',
    children: 'Link button',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="register">Register</Button>
    </div>
  ),
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    children: 'Disabled',
  },
}

export const IconOnly: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    iconOnly: true,
    'aria-label': 'Close',
    children: '✕',
  },
}

export const DarkTheme: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Dark theme button',
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'বাংলা বোতাম',
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
