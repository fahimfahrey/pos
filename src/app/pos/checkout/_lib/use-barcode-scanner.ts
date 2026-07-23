'use client'

import { useEffect, useRef, useCallback } from 'react'

const KEYSTROKE_THRESHOLD_MS = 30 // Max gap between keystrokes for scanner mode
const IDLE_FLUSH_MS = 50 // Flush buffer after this long idle

export interface BarcodeScannerOptions {
  onScan: (code: string) => void
  exemptSelectors?: string[]
}

/**
 * Hook that detects barcode scanner input via USB HID keystroke timing heuristic.
 * - Scans are characterized by very fast consecutive keystrokes (<30ms apart)
 * - Manual typing is slower and treated as regular input
 * - Provides an input element ref that should be attached to a hidden input
 */
export function useBarcodeScanner(options: BarcodeScannerOptions) {
  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef<string>('')
  const lastKeystrokeRef = useRef<number>(0)
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exemptSelectorsRef = useRef(options.exemptSelectors || [])

  const flush = useCallback(() => {
    if (bufferRef.current.length > 0) {
      options.onScan(bufferRef.current)
      bufferRef.current = ''
    }
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current)
      flushTimeoutRef.current = null
    }
  }, [options])

  const refocusInput = useCallback(() => {
    // Don't refocus if an editable element or recognized modal is focused
    if (!inputRef.current) return

    const focused = document.activeElement as HTMLElement
    if (!focused || focused === inputRef.current) {
      inputRef.current.focus()
      return
    }

    // Check if focused element is inside an exempt container
    const exemptContainer = exemptSelectorsRef.current.some((selector: string) =>
      focused.closest(selector)
    )

    if (!exemptContainer) {
      inputRef.current.focus()
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle Enter and regular character keys
      if (e.key === 'Enter') {
        flush()
        return
      }

      // Ignore meta/control keys
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
        return
      }

      const now = Date.now()
      const timeSinceLastKeystroke = now - lastKeystrokeRef.current

      // If enough time has passed, treat as non-scanner input
      if (lastKeystrokeRef.current > 0 && timeSinceLastKeystroke > KEYSTROKE_THRESHOLD_MS) {
        bufferRef.current = ''
      }

      lastKeystrokeRef.current = now
      bufferRef.current += e.key

      // Reset idle flush timer
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current)
      }

      // Set up idle flush
      flushTimeoutRef.current = setTimeout(() => {
        flush()
      }, IDLE_FLUSH_MS)
    },
    [flush]
  )

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    // Keep input focused, except when a modal/editable is active
    const focusListener = () => {
      setTimeout(refocusInput, 0)
    }

    // Global keydown listener for scanner input
    document.addEventListener('keydown', handleKeyDown)
    input.addEventListener('focusin', focusListener)
    document.addEventListener('focusin', focusListener)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      input.removeEventListener('focusin', focusListener)
      document.removeEventListener('focusin', focusListener)

      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current)
      }
    }
  }, [handleKeyDown, refocusInput])

  // Public API to focus the input
  const focus = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return {
    inputRef,
    focus,
  }
}
