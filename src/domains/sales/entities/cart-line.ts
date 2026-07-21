export interface CartLine {
  variantId: string
  name: string
  barcode?: string
  price: number // in cents
  quantity: number
  discount?: {
    type: 'percentage' | 'fixed'
    amount: number
  }
}
