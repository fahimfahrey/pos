import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    placeholder: {
      control: 'text',
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label htmlFor="input-1" className="text-label font-medium">
        Email
      </label>
      <Input id="input-1" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const Error: Story = {
  args: {
    error: true,
    errorMessage: 'This field is required',
    placeholder: 'Enter text...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
}

export const Focus: Story = {
  args: {
    placeholder: 'Click to focus',
    autoFocus: true,
  },
}

export const DarkTheme: Story = {
  args: {
    placeholder: 'Dark theme input',
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    placeholder: 'বাংলা ইনপুট',
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
