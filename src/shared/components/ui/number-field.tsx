'use client'

import * as React from 'react'
import { Input } from './input'
import { Button } from './button'
import { cn } from '@shared/utils/cn'

interface NumberFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  errorMessage?: string
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
}

const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    { className, min, max, step = 1, value, onChange, onValueChange, error, errorMessage, id, ...props },
    ref
  ) => {
    const currentValue = value ? Number(value) : 0

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      onChange?.(e)
      onValueChange?.(newValue)
    }

    const handleIncrement = () => {
      const newValue = Math.min(currentValue + step, max ?? Infinity)
      const event = new Event('change', { bubbles: true })
      const input = ref && 'current' in ref ? ref.current : null
      if (input) {
        input.value = String(newValue)
        input.dispatchEvent(event)
      }
      onValueChange?.(newValue)
    }

    const handleDecrement = () => {
      const newValue = Math.max(currentValue - step, min ?? -Infinity)
      const event = new Event('change', { bubbles: true })
      const input = ref && 'current' in ref ? ref.current : null
      if (input) {
        input.value = String(newValue)
        input.dispatchEvent(event)
      }
      onValueChange?.(newValue)
    }

    return (
      <div className="w-full">
        <div className="flex items-center gap-0">
          <Input
            ref={ref}
            type="number"
            inputMode="decimal"
            className={cn('tabular-nums', className)}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            error={error}
            {...props}
          />
          <div className="flex flex-col gap-0 border-l border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="Increase"
              onClick={handleIncrement}
              className="rounded-none"
            >
              ▲
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="Decrease"
              onClick={handleDecrement}
              className="rounded-none"
            >
              ▼
            </Button>
          </div>
        </div>
        {errorMessage && (
          <p id={id ? `${id}-error` : undefined} className="mt-1 text-caption text-danger">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

NumberField.displayName = 'NumberField'

export { NumberField }
