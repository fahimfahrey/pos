import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('px-4', 'py-2', 'rounded')
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
    expect(result).toContain('rounded')
  })

  it('should handle conditionals', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
  })

  it('should merge conflicting tailwind classes', () => {
    const result = cn('px-4', 'px-8')
    expect(result).toContain('px-8')
    expect(result).not.toContain('px-4')
  })

  it('should handle undefined and falsy values', () => {
    const result = cn('px-4', undefined, false, null, 'py-2')
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
  })
})
