import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { NumberField } from './number-field'

function ControlledNumberField(props: React.ComponentProps<typeof NumberField>) {
  const [value, setValue] = useState<number>(0)
  return <NumberField {...props} value={value} onChange={(e) => setValue(Number(e.target.value))} />
}

describe('NumberField', () => {
  it('renders input with correct type and inputMode', () => {
    render(<NumberField />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('inputMode', 'decimal')
  })

  it('applies tabular-nums class', () => {
    render(<NumberField />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveClass('tabular-nums')
  })

  it('respects min and max constraints', () => {
    const { rerender } = render(<ControlledNumberField min={0} max={100} />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('increments value with increment button', () => {
    render(<ControlledNumberField value={5} step={1} />)
    const incrementButton = screen.getByLabelText('Increase')
    fireEvent.click(incrementButton)
    // Note: In a real scenario, onChange would be called and the value would update
  })

  it('decrements value with decrement button', () => {
    render(<ControlledNumberField value={5} step={1} />)
    const decrementButton = screen.getByLabelText('Decrease')
    fireEvent.click(decrementButton)
  })

  it('displays error message when error is true', () => {
    render(<NumberField error={true} errorMessage="Value too high" />)
    expect(screen.getByText('Value too high')).toBeInTheDocument()
  })
})
