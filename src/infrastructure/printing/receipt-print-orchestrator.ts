import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'
import type { JobRunner } from '@shared/ports/job-runner'
import type { Job } from '@shared/ports/job-runner'
import { resolvePrinter, getRegisteredPrinters } from './printer-registry'
import { PrinterNotRegisteredError } from './errors'

export interface PrintRecipeOutcome {
  ok: boolean
  printerId?: string
  jobId?: string
  reason?: string
}

export async function printReceipt(
  document: ReceiptDocument,
  options: {
    jobRunner: JobRunner
    preferredPrinterId?: string
  },
): Promise<PrintRecipeOutcome> {
  const { jobRunner, preferredPrinterId } = options

  // Determine which printer to try first
  let printerIds: string[] = []

  if (preferredPrinterId) {
    printerIds.push(preferredPrinterId)
  }

  // Add fallback to browser-print
  if (printerIds[0] !== 'browser-print') {
    printerIds.push('browser-print')
  }

  // Try each printer in order
  for (const printerId of printerIds) {
    try {
      const printer = resolvePrinter(printerId)

      // Check if printer is available
      const available = await printer.isAvailable()
      if (!available) {
        continue
      }

      // Create and run the print job
      const job: Job<{ document: ReceiptDocument }, { jobId: string }> = {
        id: `print-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'print',
        payload: { document },
      }

      const result = await jobRunner.run(job, async (payload) => {
        return printer.print(payload)
      })

      if (result.ok && result.result) {
        return {
          ok: true,
          printerId,
          jobId: result.result.jobId,
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`Printer ${printerId} failed: ${message}`)
      continue
    }
  }

  // All printers failed or unavailable
  const available = getRegisteredPrinters()
  return {
    ok: false,
    reason: `No printer available. Registered: ${available.join(', ')}`,
  }
}
