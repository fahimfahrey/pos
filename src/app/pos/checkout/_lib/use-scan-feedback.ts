'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createDefaultStorageProvider } from '@infra/storage'
import { playScanSound } from './scan-sound'

export type ScanFeedbackState = 'idle' | 'success' | 'duplicate' | 'not-found'

export interface ScanFeedbackResult {
  state: ScanFeedbackState
  itemName?: string
  barcode?: string
  isLineAdded?: boolean // true if a new line was added
}

const DUPLICATE_WINDOW_MS = 1500

export function useScanFeedback(onScan: (itemName: string) => void) {
  const [feedback, setFeedback] = useState<ScanFeedbackResult>({ state: 'idle' })
  const lastScannedRef = useRef<{ code: string; time: number } | null>(null)
  const decayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const performanceMark = useRef<number>(0)

  const handleScan = useCallback(
    async (barcode: string) => {
      // Mark the scan start time for latency measurement
      performanceMark.current = performance.now()

      try {
        const provider = createDefaultStorageProvider()
        const repos = await provider.getRepositorySet()

        // Look up the variant by barcode
        const variant = await repos.catalog.findVariantByBarcode(
          undefined, // orgId determined from context in real impl
          barcode
        )

        if (!variant) {
          // Not found
          setFeedback({
            state: 'not-found',
            barcode,
          })
          playScanSound('not-found')
          return
        }

        // Check for duplicate within the window
        const now = Date.now()
        if (lastScannedRef.current &&
            lastScannedRef.current.code === barcode &&
            now - lastScannedRef.current.time < DUPLICATE_WINDOW_MS) {
          // Duplicate scan
          setFeedback({
            state: 'duplicate',
            itemName: variant.name,
            barcode,
          })
          playScanSound('duplicate')
          return
        }

        // Success
        lastScannedRef.current = { code: barcode, time: now }
        setFeedback({
          state: 'success',
          itemName: variant.name,
          barcode,
          isLineAdded: true,
        })
        playScanSound('success')
        onScan(variant.name)

        // Measure latency
        const latency = performance.now() - performanceMark.current
        console.debug(`[ScanFeedback] Latency: ${latency.toFixed(2)}ms`)
      } catch (error) {
        console.error('Scan lookup failed:', error)
        setFeedback({
          state: 'not-found',
          barcode,
        })
        playScanSound('not-found')
      }
    },
    [onScan]
  )

  // Auto-decay feedback after 2 seconds
  useEffect(() => {
    if (feedback.state === 'idle') {
      return
    }

    if (decayTimeoutRef.current) {
      clearTimeout(decayTimeoutRef.current)
    }

    decayTimeoutRef.current = setTimeout(() => {
      setFeedback({ state: 'idle' })
    }, 2000)

    return () => {
      if (decayTimeoutRef.current) {
        clearTimeout(decayTimeoutRef.current)
      }
    }
  }, [feedback.state])

  return {
    feedback,
    handleScan,
  }
}
