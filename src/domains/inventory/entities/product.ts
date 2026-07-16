export interface StockLevel {
  quantity: number
  unit: string
}

export interface Product {
  id: string
  name: string
  sku: string
  price: {
    amount: number
    currency: string
  }
  stock: StockLevel
  createdAt: Date
  updatedAt: Date
}
