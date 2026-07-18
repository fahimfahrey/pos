export interface Product {
  id: string
  name: string
  sku: string
  price: {
    amount: number
    currency: string
  }
  stock: {
    quantity: number
    unit: string
  }
  createdAt: Date
  updatedAt: Date
}
