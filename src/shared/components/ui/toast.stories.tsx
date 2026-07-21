import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import { Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from './toast'

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
}

export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Notification</ToastTitle>
      <ToastDescription>This is a toast notification</ToastDescription>
      <ToastClose />
    </Toast>
  ),
}

export const Success: Story = {
  args: {
    open: true,
    variant: 'success',
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Success</ToastTitle>
      <ToastDescription>Operation completed successfully</ToastDescription>
      <ToastClose />
    </Toast>
  ),
}

export const Danger: Story = {
  args: {
    open: true,
    variant: 'danger',
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Error</ToastTitle>
      <ToastDescription>Something went wrong</ToastDescription>
      <ToastClose />
    </Toast>
  ),
}

export const Warning: Story = {
  args: {
    open: true,
    variant: 'warning',
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Warning</ToastTitle>
      <ToastDescription>Please be careful</ToastDescription>
      <ToastClose />
    </Toast>
  ),
}

export const WithAction: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>New Update</ToastTitle>
      <ToastDescription>A new version is available</ToastDescription>
      <ToastAction altText="Update">Update</ToastAction>
      <ToastClose />
    </Toast>
  ),
}

export const DarkTheme: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Dark Toast</ToastTitle>
      <ToastDescription>In dark theme</ToastDescription>
      <ToastClose />
    </Toast>
  ),
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    open: true,
    variant: 'success',
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>সফল</ToastTitle>
      <ToastDescription>অপারেশন সফলভাবে সম্পন্ন হয়েছে</ToastDescription>
      <ToastClose />
    </Toast>
  ),
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
