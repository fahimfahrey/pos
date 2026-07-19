import type { Printer, PrintJobPayload } from '@shared/ports/printer'
import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'
import { THERMAL_RECEIPT_CSS } from './thermal-receipt.css'
import { renderReceiptHtml } from './render-receipt'

export class BrowserPrintPrinter implements Printer {
  readonly id = 'browser-print'

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && typeof window.print === 'function'
  }

  async print(payload: PrintJobPayload): Promise<{ jobId: string }> {
    const document = payload.document as ReceiptDocument

    // Create a unique job ID
    const jobId = `browser-print-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Render HTML
    const html = renderReceiptHtml(document)

    // Create iframe for printing
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document')
      }

      // Write content to iframe
      iframeDoc.open()
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>${THERMAL_RECEIPT_CSS}</style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `)
      iframeDoc.close()

      // Wait for content to load then print
      setTimeout(() => {
        iframe.contentWindow?.print()
      }, 100)
    } finally {
      // Clean up iframe after a delay
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }

    return { jobId }
  }
}
