import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { NumberField } from './number-field'

const meta: Meta<typeof NumberField> = {
  title: 'Components/NumberField',
  component: NumberField,
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NumberField>

export const Default: Story = {
  args: {
    placeholder: '0',
    step: 1,
  },
  render: (args) => {
    const [value, setValue] = useState<number>(0)
    return <NumberField {...args} value={value} onChange={(e) => setValue(Number(e.target.value))} />
  },
}

export const WithMinMax: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [value, setValue] = useState<number>(50)
    return <NumberField {...args} value={value} onChange={(e) => setValue(Number(e.target.value))} />
  },
}

export const WithDecimalStep: Story = {
  args: {
    min: 0,
    max: 10,
    step: 0.5,
  },
  render: (args) => {
    const [value, setValue] = useState<number>(0)
    return <NumberField {...args} value={value} onChange={(e) => setValue(Number(e.target.value))} />
  },
}

export const Error: Story = {
  args: {
    error: true,
    errorMessage: 'Value must be between 0 and 100',
    min: 0,
    max: 100,
  },
  render: (args) => {
    const [value, setValue] = useState<number>(150)
    return <NumberField {...args} value={value} onChange={(e) => setValue(Number(e.target.value))} />
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 42,
  },
}

export const DarkTheme: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [value, setValue] = useState<number>(50)
    return <NumberField {...args} value={value} onChange={(e) => setValue(Number(e.target.value))} />
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [value, setValue] = useState<number>(50)
    return <NumberField {...args} value={value} onChange={(e) => setValue(Number(e.target.value))} />
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
