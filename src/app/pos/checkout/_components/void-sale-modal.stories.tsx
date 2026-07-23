import type { Meta, StoryObj } from '@storybook/react'
import { VoidSaleModal } from './void-sale-modal'

// Length-stress surface (see e2e/i18n-length-stress.spec.ts): fixed-width reason buttons
// are the layout most likely to clip under pseudo-localized or Bengali text expansion.
const meta: Meta<typeof VoidSaleModal> = {
  title: 'DeviceMatrix/VoidSaleModal',
  component: VoidSaleModal,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof VoidSaleModal>

export const Default: Story = {
  args: {
    onClose: () => {},
    onConfirm: () => {},
  },
}
