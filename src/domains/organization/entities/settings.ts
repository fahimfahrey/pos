import type { TaxMode, BarcodeSymbology } from '@constants/enums'


export interface TaxRule {
  id: string
  name: string
  rate: number
  taxMode: TaxMode
}

export interface RoundingRule {
  mode: 'nearest' | 'up' | 'down'
  increment: number
}

export interface DayHours {
  open: string // HH:MM
  close: string // HH:MM
  isClosed?: boolean
}

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface ReceiptTemplate {
  headerText?: string
  footerText?: string
  showItemDescription: boolean
  showTaxBreakdown: boolean
}

export interface LoyaltyRules {
  enabled: boolean
  pointsPerDollar?: number
  rewardThreshold?: number
}

export interface ResolvedSettings {
  currency: string
  locale: string
  timezone: string
  taxMode: TaxMode
  taxRules: TaxRule[]
  receiptTemplate: ReceiptTemplate
  rounding: RoundingRule
  businessHours: BusinessHours
  barcodeSymbology: BarcodeSymbology
  loyalty: LoyaltyRules
}

export type OrganizationSettings = Partial<ResolvedSettings>
export type BranchSettings = Partial<ResolvedSettings>

export const DEFAULT_SETTINGS: ResolvedSettings = {
  currency: 'USD',
  locale: 'en-US',
  timezone: 'UTC',
  taxMode: 'exclusive',
  taxRules: [],
  receiptTemplate: {
    showItemDescription: true,
    showTaxBreakdown: true,
  },
  rounding: {
    mode: 'nearest',
    increment: 0.01,
  },
  businessHours: {
    monday: { open: '09:00', close: '17:00' },
    tuesday: { open: '09:00', close: '17:00' },
    wednesday: { open: '09:00', close: '17:00' },
    thursday: { open: '09:00', close: '17:00' },
    friday: { open: '09:00', close: '17:00' },
    saturday: { open: '10:00', close: '16:00' },
    sunday: { isClosed: true, open: '', close: '' },
  },
  barcodeSymbology: 'ean13',
  loyalty: {
    enabled: false,
  },
}
