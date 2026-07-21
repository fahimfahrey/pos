'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/cn'

const moneyVariants = cva('tabular-nums', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface MoneyProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof moneyVariants> {
  value: number
  currency: string
  locale: string
  sign?: 'always' | 'auto' | 'never'
}

const Money = React.forwardRef<HTMLSpanElement, MoneyProps>(
  ({ className, value, currency, locale, sign = 'auto', size, ...props }, ref) => {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      signDisplay: sign,
    }).format(value)

    return (
      <span ref={ref} className={cn(moneyVariants({ size, className }))} {...props}>
        {formatted}
      </span>
    )
  }
)

Money.displayName = 'Money'

export { Money, moneyVariants }
