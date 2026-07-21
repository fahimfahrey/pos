'use client'

import { useEffect, useState } from 'react'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return reducedMotion
}

// mirrors --duration-fast in globals.css
export const MOTION_TOKENS = {
  fast: 150,
  base: 300,
  slower: 500,
} as const

export const SLOW_OPERATION_THRESHOLD_MS = 400

export function useDelayedVisible(
  active: boolean,
  delayMs = SLOW_OPERATION_THRESHOLD_MS
): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }

    const timer = setTimeout(() => {
      setVisible(true)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [active, delayMs])

  return visible
}
