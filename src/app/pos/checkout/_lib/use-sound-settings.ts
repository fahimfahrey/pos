import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pos:sound-muted'

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'true'
}

export function useSoundSettings() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(isSoundMuted())

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setMuted(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleMuted = () => {
    const newValue = !muted
    setMuted(newValue)
    localStorage.setItem(STORAGE_KEY, String(newValue))
  }

  return { muted, toggleMuted }
}
