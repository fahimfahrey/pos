'use client'

import { useState } from 'react'
import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'
import { printReceipt } from '@infra/printing/receipt-print-orchestrator'
import { InProcessJobRunner } from '@infra/adapters/in-process-job-runner'

export function ReceiptActions({ document }: { document: ReceiptDocument }) {
  const [status, setStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const jobRunner = new InProcessJobRunner()

  const handlePrint = async (printerId?: string) => {
    setStatus('printing')
    setError(null)

    try {
      const outcome = await printReceipt(document, {
        jobRunner,
        preferredPrinterId: printerId,
      })

      if (outcome.ok) {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setError(outcome.reason || 'Unknown error')
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to print')
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          {status === 'printing' && (
            <div className="text-sm text-blue-600 font-medium" role="status">
              Printing...
            </div>
          )}
          {status === 'success' && (
            <div className="text-sm text-green-600 font-medium" role="status">
              Print sent successfully
            </div>
          )}
          {status === 'error' && (
            <div className="text-sm text-red-600 font-medium" role="alert">
              {error || 'Print failed'}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handlePrint('browser-print')}
            disabled={status === 'printing'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="Print receipt"
          >
            Print
          </button>

          <button
            onClick={() => handlePrint('pdf')}
            disabled={status === 'printing'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            aria-label="Download PDF"
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  )
}
