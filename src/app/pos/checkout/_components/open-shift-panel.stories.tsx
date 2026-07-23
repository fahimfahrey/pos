import type { Meta, StoryObj } from '@storybook/react'
import type { Register } from '@domains/organization/entities/register'
import { OpenShiftPanel } from './open-shift-panel'

const mockRegister: Register = {
  id: 'register-1',
  orgId: 'org-1',
  branchId: 'branch-1',
  number: '1',
  name: 'Front Counter',
  active: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

// Length-stress surface (see e2e/i18n-length-stress.spec.ts): the welcome message
// interpolates a cashier name into a translated string, a common overflow trigger.
const meta: Meta<typeof OpenShiftPanel> = {
  title: 'DeviceMatrix/OpenShiftPanel',
  component: OpenShiftPanel,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof OpenShiftPanel>

export const Default: Story = {
  args: {
    register: mockRegister,
    cashierName: 'Alexandria Montgomery-Fitzgerald',
    onShiftOpened: async () => {},
  },
}
