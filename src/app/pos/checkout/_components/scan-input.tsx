'use client'

import { forwardRef } from 'react'

export const ScanInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <input
      ref={ref}
      id="scan-input"
      type="text"
      autoFocus
      className="sr-only"
      aria-label="Barcode scanner input"
      {...props}
    />
  )
})

ScanInput.displayName = 'ScanInput'
