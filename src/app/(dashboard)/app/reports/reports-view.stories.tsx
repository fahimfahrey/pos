import type { Meta, StoryObj } from '@storybook/react'
import { ReportsView, type ReportsData } from './reports-view'

// Device-matrix visual snapshots (docs/device-matrix.md) render this component directly with
// mock data — the real /app/reports route needs a signed-in session that isn't reliably
// scriptable yet (see docs/device-matrix.md's "Testing" section).

const mockData: ReportsData = {
  rangeLabel: '2026-06-21_2026-07-21',
  period: [
    { period: '2026-07-15', grossSales: 42000, discounts: 1200, tax: 3200, netSales: 44000, saleCount: 18 },
    { period: '2026-07-16', grossSales: 51000, discounts: 900, tax: 3800, netSales: 53900, saleCount: 22 },
    { period: '2026-07-17', grossSales: 38000, discounts: 500, tax: 2900, netSales: 40400, saleCount: 15 },
  ],
  category: [
    { categoryId: 'c1', categoryName: 'Coffee', quantity: 240, grossSales: 84000, discounts: 1200, tax: 6300, netSales: 89100, saleCount: 120 },
    { categoryId: 'c2', categoryName: 'Bakery', quantity: 96, grossSales: 32000, discounts: 400, tax: 2400, netSales: 34000, saleCount: 60 },
  ],
  product: [
    { variantId: 'v1', variantName: 'Espresso', sku: 'ESP-1', quantity: 140, grossSales: 49000, discounts: 600, tax: 3700, netSales: 52100, saleCount: 90 },
    { variantId: 'v2', variantName: 'Croissant', sku: 'CRO-1', quantity: 60, grossSales: 25500, discounts: 300, tax: 1900, netSales: 27100, saleCount: 40 },
  ],
  cashier: [
    { cashierUserId: 'u1', cashierName: 'Alex Rivera', grossSales: 61000, discounts: 900, tax: 4600, netSales: 64700, saleCount: 32 },
    { cashierUserId: 'u2', cashierName: 'Jamie Chen', grossSales: 40000, discounts: 500, tax: 3000, netSales: 42500, saleCount: 23 },
  ],
  margin: [
    { variantId: 'v1', variantName: 'Espresso', sku: 'ESP-1', quantitySold: 140, revenue: 49000, cogs: 14000, margin: 35000, marginPct: 71.4, costUnavailable: false },
    { variantId: 'v2', variantName: 'Croissant', sku: 'CRO-1', quantitySold: 60, revenue: 25500, costUnavailable: true },
  ],
  tax: [
    { taxRate: 0.1, taxCollected: 8900, taxableSales: 89000 },
  ],
  payment: [
    { method: 'cash', amount: 32000, count: 20 },
    { method: 'card', amount: 68000, count: 35 },
  ],
  heatmap: [
    { dayOfWeek: 1, hour: 8, saleCount: 6, netSales: 8200 },
    { dayOfWeek: 1, hour: 12, saleCount: 14, netSales: 21000 },
    { dayOfWeek: 2, hour: 8, saleCount: 4, netSales: 5400 },
  ],
  csv: {},
  scope: {
    persona: 'Owner',
    branchLabel: 'Main Branch',
    canSeeCashiers: true,
    canSeeMargin: true,
  },
}

const meta: Meta<typeof ReportsView> = {
  title: 'DeviceMatrix/ReportsView',
  component: ReportsView,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ReportsView>

export const Default: Story = {
  args: { data: mockData },
}
