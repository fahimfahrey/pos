import { describe, it, expect } from 'vitest'
import { cartReducer, type CartState, type CartAction } from './pos-cart-context'

const mockLine = {
  variantId: 'var-1',
  name: 'Espresso',
  price: 350,
  quantity: 1,
  barcode: 'ESPRESSO-001',
  discount: null,
}

const initialState: CartState = {
  lines: [],
  cartDiscount: null,
  lastScannedCode: null,
  lastScanTime: null,
  undoStack: [],
}

describe('cartReducer', () => {
  it('should add a new line on SCAN_SUCCESS', () => {
    const action: CartAction = {
      type: 'SCAN_SUCCESS',
      line: mockLine,
    }

    const result = cartReducer(initialState, action)

    expect(result.lines).toHaveLength(1)
    expect(result.lines[0]).toEqual(mockLine)
    expect(result.lastScannedCode).toBe('ESPRESSO-001')
  })

  it('should increment existing line on duplicate SCAN_SUCCESS', () => {
    const state: CartState = {
      ...initialState,
      lines: [{ ...mockLine, quantity: 1 }],
    }

    const action: CartAction = {
      type: 'SCAN_SUCCESS',
      line: mockLine,
    }

    const result = cartReducer(state, action)

    expect(result.lines).toHaveLength(1)
    expect(result.lines[0].quantity).toBe(2)
  })

  it('should set quantity via SET_QTY', () => {
    const state: CartState = {
      ...initialState,
      lines: [mockLine],
    }

    const action: CartAction = {
      type: 'SET_QTY',
      lineIndex: 0,
      quantity: 5,
    }

    const result = cartReducer(state, action)

    expect(result.lines[0].quantity).toBe(5)
  })

  it('should remove line when quantity set to 0', () => {
    const state: CartState = {
      ...initialState,
      lines: [mockLine],
    }

    const action: CartAction = {
      type: 'SET_QTY',
      lineIndex: 0,
      quantity: 0,
    }

    const result = cartReducer(state, action)

    expect(result.lines).toHaveLength(0)
  })

  it('should remove a line via REMOVE_LINE', () => {
    const state: CartState = {
      ...initialState,
      lines: [mockLine, { ...mockLine, variantId: 'var-2', name: 'Americano' }],
    }

    const action: CartAction = {
      type: 'REMOVE_LINE',
      lineIndex: 0,
    }

    const result = cartReducer(state, action)

    expect(result.lines).toHaveLength(1)
    expect(result.lines[0].name).toBe('Americano')
  })

  it('should set line discount via SET_LINE_DISCOUNT', () => {
    const state: CartState = {
      ...initialState,
      lines: [mockLine],
    }

    const action: CartAction = {
      type: 'SET_LINE_DISCOUNT',
      lineIndex: 0,
      discount: { type: 'percentage', amount: 10 },
    }

    const result = cartReducer(state, action)

    expect(result.lines[0].discount).toEqual({ type: 'percentage', amount: 10 })
  })

  it('should clear line discount via CLEAR_LINE_DISCOUNT', () => {
    const state: CartState = {
      ...initialState,
      lines: [{ ...mockLine, discount: { type: 'percentage', amount: 10 } }],
    }

    const action: CartAction = {
      type: 'CLEAR_LINE_DISCOUNT',
      lineIndex: 0,
    }

    const result = cartReducer(state, action)

    expect(result.lines[0].discount).toBeNull()
  })

  it('should set cart-level discount via SET_CART_DISCOUNT', () => {
    const action: CartAction = {
      type: 'SET_CART_DISCOUNT',
      discount: { type: 'fixed', amount: 500 },
    }

    const result = cartReducer(initialState, action)

    expect(result.cartDiscount).toEqual({ type: 'fixed', amount: 500 })
  })

  it('should undo last scan via UNDO_LAST_SCAN', () => {
    const state: CartState = {
      ...initialState,
      lines: [mockLine],
      undoStack: [[]], // Previous state
    }

    const action: CartAction = {
      type: 'UNDO_LAST_SCAN',
    }

    const result = cartReducer(state, action)

    expect(result.lines).toHaveLength(0)
  })

  it('should hold cart via HOLD_CART', () => {
    const state: CartState = {
      ...initialState,
      lines: [mockLine],
      cartDiscount: { type: 'percentage', amount: 10 },
    }

    const action: CartAction = {
      type: 'HOLD_CART',
    }

    const result = cartReducer(state, action)

    expect(result.lines).toHaveLength(0)
    expect(result.cartDiscount).toBeNull()
  })

  it('should resume cart via RESUME_CART', () => {
    const action: CartAction = {
      type: 'RESUME_CART',
      lines: [mockLine],
    }

    const result = cartReducer(initialState, action)

    expect(result.lines).toEqual([mockLine])
  })

  it('should reset cart via RESET', () => {
    const state: CartState = {
      ...initialState,
      lines: [mockLine],
      cartDiscount: { type: 'percentage', amount: 10 },
      undoStack: [[mockLine]],
    }

    const action: CartAction = {
      type: 'RESET',
    }

    const result = cartReducer(state, action)

    expect(result.lines).toHaveLength(0)
    expect(result.cartDiscount).toBeNull()
    expect(result.undoStack).toHaveLength(0)
  })

  it('should maintain undo stack cap at 10 items', () => {
    let state: CartState = initialState

    // Add 12 scans to the undo stack
    for (let i = 0; i < 12; i++) {
      const action: CartAction = {
        type: 'SCAN_SUCCESS',
        line: { ...mockLine, variantId: `var-${i}` },
      }
      state = cartReducer(state, action)
    }

    expect(state.undoStack.length).toBeLessThanOrEqual(10)
  })
})
