import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'
import { THERMAL_RECEIPT_CSS } from '@infra/printing/adapters/browser-print/thermal-receipt.css'
import { renderReceiptHtml } from '@infra/printing/adapters/browser-print/render-receipt'

export function ReceiptView({ document }: { document: ReceiptDocument }) {
  const html = renderReceiptHtml(document)

  return (
    <div className="w-screen min-h-screen bg-gray-50 p-8">
      <style dangerouslySetInnerHTML={{ __html: THERMAL_RECEIPT_CSS }} />

      <div className="max-w-2xl mx-auto">
        <div
          className="receipt-container"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
