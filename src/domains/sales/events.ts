export type SalesEvent = {
  type: 'sale.finalized'
  saleId: string
  orgId: string
  branchId: string
  shiftId: string
}
