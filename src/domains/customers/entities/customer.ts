export interface Customer {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  createdAt: Date
  updatedAt: Date
}
