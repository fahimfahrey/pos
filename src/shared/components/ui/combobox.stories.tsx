import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Combobox, type ComboboxOption } from './combobox'

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
}

export default meta
type Story = StoryObj<typeof Combobox>

const FRUITS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
]

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return <Combobox options={FRUITS} value={value} onValueChange={setValue} placeholder="Search fruits..." />
  },
}

export const WithPreselection: Story = {
  render: () => {
    const [value, setValue] = useState('banana')
    return (
      <Combobox
        options={FRUITS}
        value={value}
        onValueChange={setValue}
        placeholder="Search fruits..."
      />
    )
  },
}

export const Error: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <Combobox
        options={FRUITS}
        value={value}
        onValueChange={setValue}
        error={true}
        errorMessage="Please select a valid fruit"
        placeholder="Search fruits..."
      />
    )
  },
}

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <Combobox
        options={FRUITS}
        value={value}
        onValueChange={setValue}
        disabled={true}
        placeholder="Search fruits..."
      />
    )
  },
}

export const DarkTheme: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <Combobox
        options={FRUITS}
        value={value}
        onValueChange={setValue}
        placeholder="Search fruits..."
      />
    )
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const bengaliFruits: ComboboxOption[] = [
      { value: 'apple', label: 'আপেল' },
      { value: 'banana', label: 'কলা' },
      { value: 'mango', label: 'আম' },
    ]
    return (
      <Combobox
        options={bengaliFruits}
        value={value}
        onValueChange={setValue}
        placeholder="ফল খুঁজুন..."
      />
    )
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
