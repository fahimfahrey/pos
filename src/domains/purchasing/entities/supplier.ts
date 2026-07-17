export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
