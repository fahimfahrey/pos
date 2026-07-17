export interface Store {
  id: string
  name: string
  address: string
  city: string
  zipCode: string
  country: string
  phone?: string
  email?: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface Register {
  id: string
  storeId: string
  number: string
  name: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSetting {
  id: string
  key: string
  value: string
  createdAt: Date
  updatedAt: Date
}
