'use client'

import { useEffect } from 'react'

export const SHORTCUTS = {
  submit_scan: { key: 'Enter' },
  open_payment: { key: 'F2' },
  hold_cart: { key: 'F3' },
  show_held: { key: 'F4' },
  void_sale: { key: 'F6' },
  cart_discount: { key: 'F8' },
  undo_scan: { key: 'Ctrl+Z' },
  close_modal: { key: 'Escape' },
  show_help: { key: '?' },
}

export interface KeyboardShortcutHandlers {
  onPayment?: () => void
  onHoldCart?: () => void
  onShowHeld?: () => void
  onVoidSale?: () => void
  onCartDiscount?: () => void
  onUndoScan?: () => void
  onCloseModal?: () => void
  onShowHelp?: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on a text input (except for the scan input which is hidden)
      const activeElement = document.activeElement as HTMLElement
      if (
        activeElement instanceof HTMLInputElement &&
        activeElement.type === 'text' &&
        activeElement.id !== 'scan-input'
      ) {
        return
      }

      if (activeElement instanceof HTMLTextAreaElement) {
        return
      }

      // Handle shortcuts
      const key = e.key.toUpperCase()

      if (e.key === 'F2') {
        e.preventDefault()
        handlers.onPayment?.()
      } else if (e.key === 'F3') {
        e.preventDefault()
        handlers.onHoldCart?.()
      } else if (e.key === 'F4') {
        e.preventDefault()
        handlers.onShowHeld?.()
      } else if (e.key === 'F6') {
        e.preventDefault()
        handlers.onVoidSale?.()
      } else if (e.key === 'F8') {
        e.preventDefault()
        handlers.onCartDiscount?.()
      } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        handlers.onUndoScan?.()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handlers.onCloseModal?.()
      } else if (e.shiftKey && e.key === '?') {
        e.preventDefault()
        handlers.onShowHelp?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
