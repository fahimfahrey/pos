import { cn } from '@shared/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md'
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClass
      )}
    />
  )
}
