export interface Customer {
  id: string
  orgId: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  storeCreditBalance: number
  loyaltyPointsBalance: number
  createdAt: Date
  updatedAt: Date
}
