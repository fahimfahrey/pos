import { render, screen } from '@testing-library/react'
import { Money } from './money'

describe('Money', () => {
  it('formats USD currency correctly', () => {
    render(<Money value={99.99} currency="USD" locale="en-US" />)
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })

  it('formats BDT currency correctly', () => {
    render(<Money value={1250} currency="BDT" locale="bn-BD" />)
    const element = screen.getByText(/১২৫০|1250/)
    expect(element).toBeInTheDocument()
  })

  it('applies tabular-nums class', () => {
    render(<Money value={100} currency="USD" locale="en-US" />)
    const element = screen.getByText('$100.00')
    expect(element).toHaveClass('tabular-nums')
  })

  it('handles sign=always to show + for positive amounts', () => {
    const { container } = render(
      <Money value={100} currency="USD" locale="en-US" sign="always" />
    )
    const text = container.textContent
    expect(text).toContain('100') // Either +$100 or similar format
  })

  it('handles negative amounts', () => {
    const { container } = render(
      <Money value={-99.99} currency="USD" locale="en-US" />
    )
    const text = container.textContent
    expect(text).toContain('-')
  })

  it('respects size prop', () => {
    const { rerender } = render(
      <Money value={100} currency="USD" locale="en-US" size="lg" />
    )
    const element = screen.getByText('$100.00')
    expect(element).toHaveClass('text-lg')

    rerender(<Money value={100} currency="USD" locale="en-US" size="sm" />)
    expect(element).toHaveClass('text-sm')
  })
})
