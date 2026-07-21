import { render, screen } from '@testing-library/react'
import { Input } from './input'

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Test placeholder" />)
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
  })

  it('sets aria-invalid when error is true', () => {
    render(<Input error={true} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('displays error message and sets aria-describedby', () => {
    render(<Input id="test-input" error={true} errorMessage="This is required" />)
    expect(screen.getByText('This is required')).toBeInTheDocument()
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('disables input when disabled prop is true', () => {
    render(<Input disabled={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
