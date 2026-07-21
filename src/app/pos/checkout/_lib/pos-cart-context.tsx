'use client'

import React, { createContext, useContext, useReducer } from 'react'
import type { CartLine } from '@domains/sales/entities/cart-line'
import type { ParkedCart } from '@domains/sales/entities/parked-cart'

export interface CartState {
  lines: CartLine[]
  cartDiscount: { type: 'percentage' | 'fixed'; amount: number } | null
  lastScannedCode: string | null
  lastScanTime: number | null
  undoStack: CartLine[][] // Stack of line arrays for undo
}

export type CartAction =
  | {
      type: 'SCAN_SUCCESS'
      line: CartLine
    }
  | {
      type: 'SET_QTY'
      lineIndex: number
      quantity: number
    }
  | {
      type: 'REMOVE_LINE'
      lineIndex: number
    }
  | {
      type: 'SET_LINE_DISCOUNT'
      lineIndex: number
      discount: { type: 'percentage' | 'fixed'; amount: number }
    }
  | {
      type: 'CLEAR_LINE_DISCOUNT'
      lineIndex: number
    }
  | {
      type: 'SET_CART_DISCOUNT'
      discount: { type: 'percentage' | 'fixed'; amount: number }
    }
  | {
      type: 'CLEAR_CART_DISCOUNT'
    }
  | {
      type: 'UNDO_LAST_SCAN'
    }
  | {
      type: 'HOLD_CART'
    }
  | {
      type: 'RESUME_CART'
      lines: CartLine[]
    }
  | {
      type: 'RESET'
    }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SCAN_SUCCESS': {
      const existingIndex = state.lines.findIndex((l) => l.variantId === action.line.variantId)

      if (existingIndex >= 0) {
        // Increment existing line
        const updated = [...state.lines]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + action.line.quantity,
        }
        return {
          ...state,
          lines: updated,
          lastScannedCode: action.line.barcode,
          lastScanTime: Date.now(),
          undoStack: [state.lines, ...state.undoStack.slice(0, 9)],
        }
      }

      // Add new line
      return {
        ...state,
        lines: [...state.lines, action.line],
        lastScannedCode: action.line.barcode,
        lastScanTime: Date.now(),
        undoStack: [state.lines, ...state.undoStack.slice(0, 9)],
      }
    }

    case 'SET_QTY': {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_LINE', lineIndex: action.lineIndex })
      }

      const updated = [...state.lines]
      updated[action.lineIndex] = {
        ...updated[action.lineIndex],
        quantity: action.quantity,
      }
      return {
        ...state,
        lines: updated,
      }
    }

    case 'REMOVE_LINE': {
      return {
        ...state,
        lines: state.lines.filter((_, i) => i !== action.lineIndex),
      }
    }

    case 'SET_LINE_DISCOUNT': {
      const updated = [...state.lines]
      updated[action.lineIndex] = {
        ...updated[action.lineIndex],
        discount: action.discount,
      }
      return {
        ...state,
        lines: updated,
      }
    }

    case 'CLEAR_LINE_DISCOUNT': {
      const updated = [...state.lines]
      updated[action.lineIndex] = {
        ...updated[action.lineIndex],
        discount: null,
      }
      return {
        ...state,
        lines: updated,
      }
    }

    case 'SET_CART_DISCOUNT': {
      return {
        ...state,
        cartDiscount: action.discount,
      }
    }

    case 'CLEAR_CART_DISCOUNT': {
      return {
        ...state,
        cartDiscount: null,
      }
    }

    case 'UNDO_LAST_SCAN': {
      if (state.undoStack.length === 0) {
        return state
      }

      const [previousLines, ...rest] = state.undoStack
      return {
        ...state,
        lines: previousLines,
        undoStack: rest,
      }
    }

    case 'HOLD_CART': {
      return {
        lines: [],
        cartDiscount: null,
        lastScannedCode: null,
        lastScanTime: null,
        undoStack: [],
      }
    }

    case 'RESUME_CART': {
      return {
        ...state,
        lines: action.lines,
      }
    }

    case 'RESET': {
      return {
        lines: [],
        cartDiscount: null,
        lastScannedCode: null,
        lastScanTime: null,
        undoStack: [],
      }
    }

    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

const initialState: CartState = {
  lines: [],
  cartDiscount: null,
  lastScannedCode: null,
  lastScanTime: null,
  undoStack: [],
}

interface CartContextValue {
  state: CartState
  dispatch: (action: CartAction) => void
}

const PosCartContext = createContext<CartContextValue | null>(null)

export function PosCartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  return (
    <PosCartContext.Provider value={{ state, dispatch }}>
      {children}
    </PosCartContext.Provider>
  )
}

export function usePosCart() {
  const context = useContext(PosCartContext)
  if (!context) {
    throw new Error('usePosCart must be used within PosCartProvider')
  }
  return context
}
