import { useEffect, useState } from 'react'
import { useReducedMotion } from '@shared/utils/motion'

interface AnimatingItem<T> {
  item: T
  key: string
  isExiting: boolean
}

export function useExitAnimation<T>(items: T[], getKey: (item: T) => string) {
  const [animatingItems, setAnimatingItems] = useState<AnimatingItem<T>[]>(
    items.map((item) => ({
      item,
      key: getKey(item),
      isExiting: false,
    }))
  )
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const previousKeys = new Set(animatingItems.map((x) => x.key))
    const currentKeys = new Set(items.map((x) => getKey(x)))

    const newItems = items.map((item) => ({
      item,
      key: getKey(item),
      isExiting: false,
    }))

    const exitingItems = animatingItems.filter(
      (x) => x.isExiting || !currentKeys.has(x.key)
    )
    const toExit = animatingItems.filter((x => !x.isExiting && !currentKeys.has(x.key)))

    setAnimatingItems([
      ...newItems,
      ...toExit.map((x) => ({ ...x, isExiting: true })),
      ...exitingItems.filter((x) => toExit.every((t) => t.key !== x.key)),
    ])
  }, [items, getKey])

  const handleAnimationEnd = (key: string) => {
    if (reducedMotion) return
    setAnimatingItems((prev) => prev.filter((x) => x.key !== key))
  }

  return { animatingItems, handleAnimationEnd }
}
