export type ReceiptEvent =
  | {
      type: 'receipt.print.requested'
      saleId: string
      printerId?: string
    }
  | {
      type: 'receipt.print.succeeded'
      saleId: string
      printerId: string
      jobId: string
    }
  | {
      type: 'receipt.print.failed'
      saleId: string
      printerId: string
      reason: string
    }
