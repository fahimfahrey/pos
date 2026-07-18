export interface Product {
  id: string
  orgId: string
  categoryId: string
  name: string
  description?: string
  imageFileId?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
