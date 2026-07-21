'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, id, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const errorId = errorMessage ? `${id || ''}-error` : undefined
    const describedBy = ariaDescribedBy || errorId

    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          className={cn(
            'flex w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-body placeholder:text-foreground-muted focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-danger',
            className
          )}
          aria-invalid={error}
          aria-describedby={describedBy}
          {...props}
        />
        {errorMessage && (
          <p id={errorId} className="mt-1 text-caption text-danger">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
