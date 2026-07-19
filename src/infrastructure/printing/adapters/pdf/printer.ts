import type { Printer, PrintJobPayload } from '@shared/ports/printer'
import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'
import { THERMAL_RECEIPT_CSS } from '../browser-print/thermal-receipt.css'
import { renderReceiptHtml } from '../browser-print/render-receipt'

export class PdfPrinter implements Printer {
  readonly id = 'pdf'

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined'
  }

  async print(payload: PrintJobPayload): Promise<{ jobId: string }> {
    const document = payload.document as ReceiptDocument

    // Create a unique job ID
    const jobId = `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Render HTML
    const html = renderReceiptHtml(document)

    // Create a blob URL for the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt #${document.receiptNumber}</title>
        <style>${THERMAL_RECEIPT_CSS}</style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    // Open in a new window and trigger print dialog
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    } else {
      URL.revokeObjectURL(url)
      throw new Error('Failed to open print window')
    }

    // Revoke URL after a delay (after print dialog is closed or printed)
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 5000)

    return { jobId }
  }
}
