import { z } from 'zod'

export const adjustStockInputSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  variantId: z.string().min(1, 'Variant is required'),
  quantity: z.coerce.number().int('Quantity must be a whole number'),
  reason: z.string().trim().min(1, 'Reason is required'),
})

export const transferStockInputSchema = z.object({
  variantId: z.string().min(1, 'Variant is required'),
  fromBranchId: z.string().min(1, 'Source branch is required'),
  toBranchId: z.string().min(1, 'Destination branch is required'),
  quantity: z.coerce.number().int('Quantity must be a whole number').positive('Quantity must be positive'),
}).refine((data) => data.fromBranchId !== data.toBranchId, {
  message: 'Source and destination branches must be different',
  path: ['toBranchId'],
})

export const recordCountInputSchema = z.object({
  sessionId: z.string().min(1, 'Session is required'),
  variantId: z.string().min(1, 'Variant is required'),
  countedQuantity: z.coerce.number().int('Quantity must be a whole number').min(0, 'Quantity cannot be negative'),
})

export type AdjustStockInput = z.infer<typeof adjustStockInputSchema>
export type TransferStockInput = z.infer<typeof transferStockInputSchema>
export type RecordCountInput = z.infer<typeof recordCountInputSchema>
