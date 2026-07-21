'use client'

import React from 'react'
import { cn } from '@shared/utils/cn'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null)
    const finalRef = ref || internalRef

    React.useEffect(() => {
      if (React.isRef(finalRef) && 'current' in finalRef && finalRef.current) {
        finalRef.current.indeterminate = indeterminate ?? false
      }
    }, [indeterminate, finalRef])

    return (
      <input
        ref={finalRef}
        type="checkbox"
        className={cn(
          'w-4 h-4 rounded-[var(--radius-input)] border border-border accent-accent cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
