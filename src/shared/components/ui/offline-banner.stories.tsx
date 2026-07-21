import type { Meta, StoryObj } from '@storybook/react'
import { OfflineBanner } from './offline-banner'

const meta: Meta<typeof OfflineBanner> = {
  title: 'Components/OfflineBanner',
  component: OfflineBanner,
}

export default meta
type Story = StoryObj<typeof OfflineBanner>

export const Online: Story = {
  args: {
    isOnline: true,
  },
}

export const Offline: Story = {
  args: {
    isOnline: false,
  },
}

export const OfflineWithPending: Story = {
  args: {
    isOnline: false,
    pendingCount: 3,
  },
}

export const CompactOffline: Story = {
  args: {
    isOnline: false,
    compact: true,
  },
}

export const CompactOfflineWithPending: Story = {
  args: {
    isOnline: false,
    pendingCount: 5,
    compact: true,
  },
}

export const DarkTheme: Story = {
  args: {
    isOnline: false,
    pendingCount: 2,
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  args: {
    isOnline: false,
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
  render: (args) => (
    <OfflineBanner {...args}>
      <div className="flex items-center gap-2">
        <span className="text-lg">● অফলাইন</span>
      </div>
      <p className="text-sm text-foreground-muted">
        আপনি অফলাইন — বিক্রয় এবং পরিবর্তনগুলি এই ডিভাইসে সংরক্ষণ করা হয় এবং যখন আপনি আবার অনলাইনে আসবেন তখন সিঙ্ক হবে।
      </p>
    </OfflineBanner>
  ),
}
