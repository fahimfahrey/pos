'use client'

import { useState } from 'react'

interface QtyStepperProps {
  value: number
  onChange: (qty: number) => void
}

export function QtyStepper({ value, onChange }: QtyStepperProps) {
  const [inputValue, setInputValue] = useState(String(value))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    if (val === '') {
      return
    }

    const num = parseInt(val, 10)
    if (!isNaN(num) && num > 0) {
      onChange(num)
    }
  }

  const handleInputBlur = () => {
    setInputValue(String(value))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const num = parseInt(inputValue, 10)
      if (!isNaN(num) && num > 0) {
        onChange(num)
        e.currentTarget.blur()
      }
    } else if (e.key === 'Escape') {
      setInputValue(String(value))
      e.currentTarget.blur()
    }
  }

  return (
    <div
      className="flex gap-1 items-center border border-border bg-surface rounded-[var(--radius-input)] p-1"
      data-scan-exempt
    >
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-10 w-10 min-h-10 min-w-10 flex items-center justify-center rounded-[var(--radius-input)] hover:bg-background transition-colors font-bold text-lg"
        aria-label="Decrease quantity"
      >
        −
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        className="w-12 text-center text-foreground bg-transparent font-semibold border-0 outline-0 text-base"
      />

      <button
        onClick={() => onChange(value + 1)}
        className="h-10 w-10 min-h-10 min-w-10 flex items-center justify-center rounded-[var(--radius-input)] hover:bg-background transition-colors font-bold text-lg"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
