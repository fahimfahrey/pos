'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/cn'
import { VisuallyHidden } from './visually-hidden'
import { Spinner } from './spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] text-label font-medium transition-colors focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-foreground hover:bg-accent-strong',
        secondary: 'border border-border bg-surface text-foreground hover:bg-background',
        destructive: 'bg-danger text-[var(--on-danger)] hover:bg-danger/90',
        ghost: 'hover:bg-surface text-foreground',
        link: 'text-accent hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
        register: 'h-14 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  iconOnly?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, iconOnly, disabled, 'aria-label': ariaLabel, children, ...props }, ref) => {
    const isDisabled = disabled || loading

    if (iconOnly && !ariaLabel) {
      console.warn('Button with iconOnly=true must have an aria-label prop')
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <Spinner size="sm" />
        )}
        {iconOnly ? (
          <>
            {children}
            {ariaLabel && <VisuallyHidden>{ariaLabel}</VisuallyHidden>}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
