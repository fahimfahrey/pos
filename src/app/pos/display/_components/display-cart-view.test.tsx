import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DisplayCartView } from './display-cart-view'
import type { CartSnapshot } from '@domains/sales/entities/cart-snapshot'

describe('DisplayCartView', () => {
  it('renders idle state when no cart provided', () => {
    render(<DisplayCartView cart={null} />)

    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('No active sale')).toBeInTheDocument()
  })

  it('renders cart with line items', () => {
    const cart: CartSnapshot = {
      registerId: 'reg-1',
      lines: [
        {
          variantId: 'var-1',
          name: 'Widget',
          sku: 'WID-001',
          quantity: 2,
          unitPrice: 10.0,
          lineTotal: 20.0,
        },
        {
          variantId: 'var-2',
          name: 'Gadget',
          sku: 'GAD-001',
          quantity: 1,
          unitPrice: 15.0,
          lineTotal: 15.0,
        },
      ],
      subtotal: 35.0,
      discount: 0,
      tax: 3.5,
      total: 38.5,
      updatedAt: new Date().toISOString(),
    }

    render(<DisplayCartView cart={cart} />)

    expect(screen.getByText('Current Order')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
    expect(screen.getByText('WID-001')).toBeInTheDocument()
    expect(screen.getByText('Gadget')).toBeInTheDocument()
    expect(screen.getByText('GAD-001')).toBeInTheDocument()
  })

  it('displays totals correctly', () => {
    const cart: CartSnapshot = {
      registerId: 'reg-1',
      lines: [
        {
          variantId: 'var-1',
          name: 'Item',
          sku: 'ITEM-1',
          quantity: 1,
          unitPrice: 100.0,
          lineTotal: 100.0,
        },
      ],
      subtotal: 100.0,
      discount: 10.0,
      tax: 9.0,
      total: 99.0,
      updatedAt: new Date().toISOString(),
    }

    render(<DisplayCartView cart={cart} />)

    expect(screen.getByText(/Discount:/)).toBeInTheDocument()
    expect(screen.getByText(/\$10.00/)).toBeInTheDocument()
    expect(screen.getByText(/Tax:/)).toBeInTheDocument()
    expect(screen.getByText(/Total:/)).toBeInTheDocument()
  })

  it('renders without discount when discount is zero', () => {
    const cart: CartSnapshot = {
      registerId: 'reg-1',
      lines: [
        {
          variantId: 'var-1',
          name: 'Item',
          sku: 'ITEM-1',
          quantity: 1,
          unitPrice: 10.0,
          lineTotal: 10.0,
        },
      ],
      subtotal: 10.0,
      discount: 0,
      tax: 1.0,
      total: 11.0,
      updatedAt: new Date().toISOString(),
    }

    const { container } = render(<DisplayCartView cart={cart} />)

    // Should not render discount section
    expect(container.textContent).not.toContain('Discount:')
  })
})
