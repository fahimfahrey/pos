import type { Meta, StoryObj } from '@storybook/react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from './select'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
}

export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select an option..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
        <SelectItem value="option-2">Option 2</SelectItem>
        <SelectItem value="option-3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a fruit..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48" disabled>
        <SelectValue placeholder="Disabled select..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
        <SelectItem value="b">Option B</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="একটি বিকল্প নির্বাচন করুন..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">বিকল্প 1</SelectItem>
        <SelectItem value="option-2">বিকল্প 2</SelectItem>
        <SelectItem value="option-3">বিকল্প 3</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
