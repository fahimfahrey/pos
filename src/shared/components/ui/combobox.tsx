'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Input } from './input'
import { cn } from '@shared/utils/cn'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  onInputChange?: (input: string) => void
  error?: boolean
  errorMessage?: string
}

const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (
    { options, value, onValueChange, onInputChange, error, errorMessage, placeholder, ...props },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [input, setInput] = React.useState('')
    const [highlightedIndex, setHighlightedIndex] = React.useState(0)

    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(input.toLowerCase()) ||
        option.value.toLowerCase().includes(input.toLowerCase())
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value)
      setHighlightedIndex(0)
      setOpen(true)
      onInputChange?.(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredOptions[highlightedIndex]) {
            selectOption(filteredOptions[highlightedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setOpen(false)
          break
      }
    }

    const selectOption = (option: ComboboxOption) => {
      onValueChange?.(option.value)
      setInput(option.label)
      setOpen(false)
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <Input
            ref={ref}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            error={error}
            errorMessage={errorMessage}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="combobox-listbox"
            {...props}
          />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Content className="w-[--radix-popover-trigger-width] p-0">
          <div
            id="combobox-listbox"
            role="listbox"
            className="max-h-64 overflow-auto rounded-[var(--radius-input)] border border-border bg-surface"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-foreground-muted text-caption">No options found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => selectOption(option)}
                  className={cn(
                    'px-3 py-2 cursor-pointer text-body transition-colors',
                    index === highlightedIndex && 'bg-surface-muted',
                    value === option.value && 'bg-accent text-accent-foreground'
                  )}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    )
  }
)

Combobox.displayName = 'Combobox'

export { Combobox }
export type { ComboboxOption }
