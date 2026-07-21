'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'

const skeletonStyles = `
  @keyframes skeleton-loading {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.4; }
  }

  .skeleton {
    animation: skeleton-loading 2s infinite;
  }
`

// Inject the keyframe styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = skeletonStyles
  document.head.appendChild(style)
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, variant = 'rect', ...props }, ref) => (
  <div
    ref={ref}
    className={cn('skeleton bg-foreground-muted', variant === 'circle' && 'rounded-full', className)}
    aria-hidden="true"
    {...props}
  />
))

Skeleton.displayName = 'Skeleton'

export { Skeleton }
