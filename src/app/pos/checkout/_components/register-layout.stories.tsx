import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { Register } from '@domains/organization/entities/register'
import type { Shift } from '@domains/sales/entities/shift'
import { SHIFT_STATUS } from '@domains/sales/entities/shift'
import { PosCartProvider, usePosCart } from '../_lib/pos-cart-context'
import { RegisterLayout } from './register-layout'

// Device-matrix visual snapshots (docs/device-matrix.md) render this component directly
// with mock props/cart lines, bypassing the real /pos/checkout route — that route needs a
// signed-in session plus client-side (IndexedDB) onboarding state that isn't reliably
// scriptable yet (see docs/device-matrix.md's "Testing" section).

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

const mockShift: Shift = {
  id: 'shift-1',
  orgId: 'org-1',
  branchId: 'branch-1',
  registerId: 'register-1',
  cashierUserId: 'user-1',
  status: SHIFT_STATUS.OPEN,
  floatAmount: 10000,
  openedAt: new Date(Date.now() - 90 * 60 * 1000),
}

const mockLines = [
  { variantId: 'v1', name: 'Espresso', barcode: '111', price: 350, quantity: 2 },
  { variantId: 'v2', name: 'Croissant', barcode: '222', price: 425, quantity: 1 },
  { variantId: 'v3', name: 'Oat Milk Latte', barcode: '333', price: 550, quantity: 3, discount: { type: 'percentage' as const, amount: 10 } },
]

function SeedCart({ children }: { children: React.ReactNode }) {
  const { dispatch } = usePosCart()
  useEffect(() => {
    for (const line of mockLines) {
      dispatch({ type: 'SCAN_SUCCESS', line })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>{children}</>
}

const meta: Meta<typeof RegisterLayout> = {
  title: 'DeviceMatrix/RegisterLayout',
  component: RegisterLayout,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <PosCartProvider>
        <SeedCart>
          <div className="h-dvh">
            <Story />
          </div>
        </SeedCart>
      </PosCartProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RegisterLayout>

export const WithCart: Story = {
  args: {
    register: mockRegister,
    shift: mockShift,
    cashierId: 'user-1',
    cashierName: 'Alex Rivera',
    orgId: 'org-1',
  },
}
