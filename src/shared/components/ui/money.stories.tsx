import type { Meta, StoryObj } from '@storybook/react'
import { Money } from './money'

const meta: Meta<typeof Money> = {
  title: 'Components/Money',
  component: Money,
  argTypes: {
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      control: { type: 'radio' },
    },
    sign: {
      options: ['always', 'auto', 'never'],
      control: { type: 'radio' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Money>

export const Default: Story = {
  args: {
    value: 99.99,
    currency: 'USD',
    locale: 'en-US',
  },
}

export const Euro: Story = {
  args: {
    value: 49.5,
    currency: 'EUR',
    locale: 'en-EU',
  },
}

export const Bengali: Story = {
  args: {
    value: 1250.5,
    currency: 'BDT',
    locale: 'bn-BD',
  },
}

export const NegativeAmount: Story = {
  args: {
    value: -150,
    currency: 'USD',
    locale: 'en-US',
  },
}

export const AlwaysShowSign: Story = {
  args: {
    value: 100,
    currency: 'USD',
    locale: 'en-US',
    sign: 'always',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Money value={99.99} currency="USD" locale="en-US" size="xs" />
      <Money value={99.99} currency="USD" locale="en-US" size="sm" />
      <Money value={99.99} currency="USD" locale="en-US" size="md" />
      <Money value={99.99} currency="USD" locale="en-US" size="lg" />
      <Money value={99.99} currency="USD" locale="en-US" size="xl" />
      <Money value={99.99} currency="USD" locale="en-US" size="2xl" />
    </div>
  ),
}

export const DarkTheme: Story = {
  args: {
    value: 199.99,
    currency: 'USD',
    locale: 'en-US',
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    value: 2500,
    currency: 'BDT',
    locale: 'bn-BD',
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
