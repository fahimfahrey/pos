import type { Meta, StoryObj } from '@storybook/react'
import { RouteError } from './route-error'

const meta: Meta<typeof RouteError> = {
  title: 'Components/RouteError',
  component: RouteError,
}

export default meta
type Story = StoryObj<typeof RouteError>

export const SystemError: Story = {
  args: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Your data on this device is safe. Please try again.',
    kind: 'system',
    retry: () => console.log('Retrying...'),
  },
}

export const UserError: Story = {
  args: {
    title: 'Invalid credentials',
    message: 'The username or password you entered is incorrect. Please try again.',
    kind: 'user',
  },
}

export const UserErrorWithAction: Story = {
  args: {
    title: 'Organization required',
    message: 'Please select an organization to continue.',
    kind: 'user',
    secondaryAction: {
      label: 'Go back',
      onClick: () => console.log('Going back...'),
    },
  },
}

export const StorageQuotaError: Story = {
  args: {
    title: 'Storage full',
    message: 'This device is out of storage space. Free up space (clear browser data for other sites, or delete old receipts) and try again.',
    kind: 'system',
    retry: () => console.log('Retrying...'),
  },
}

export const Inline: Story = {
  args: {
    title: 'Invalid input',
    message: 'Please check your entries and try again.',
    kind: 'user',
    inline: true,
  },
}

export const InlineWithRetry: Story = {
  args: {
    title: 'Failed to load',
    message: 'Unable to retrieve data. Your existing data is safe.',
    kind: 'system',
    inline: true,
    retry: () => console.log('Retrying...'),
  },
}

export const DarkTheme: Story = {
  args: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Your data on this device is safe. Please try again.',
    kind: 'system',
    retry: () => console.log('Retrying...'),
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    title: 'কিছু ভুল হয়েছে',
    message: 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। আপনার ডিভাইসে আপনার ডেটা নিরাপদ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    kind: 'system',
    retry: () => console.log('Retrying...'),
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
