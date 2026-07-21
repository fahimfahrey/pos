import { useCallback, useEffect, useState } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning'
  duration?: number
  open?: boolean
}

type ToastActionType = { type: 'ADD_TOAST'; toast: Toast } | { type: 'REMOVE_TOAST'; toastId: string }

const toastEmitter = {
  listeners: new Set<(toasts: Toast[]) => void>(),
  toasts: [] as Toast[],

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  },

  notify() {
    this.listeners.forEach((listener) => listener(this.toasts))
  },

  add(toast: Toast) {
    const id = toast.id || Math.random().toString(36).slice(2)
    const newToast = { ...toast, id }
    this.toasts = [newToast, ...this.toasts]
    this.notify()

    if (toast.duration !== Infinity) {
      const duration = toast.duration ?? 5000
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }

    return id
  },

  remove(toastId: string) {
    this.toasts = this.toasts.filter((t) => t.id !== toastId)
    this.notify()
  },
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastEmitter.subscribe(setToasts)
  }, [])

  const toast = useCallback(
    (props: Omit<Toast, 'id'>) => {
      return toastEmitter.add(props)
    },
    []
  )

  const dismiss = useCallback((toastId: string) => {
    toastEmitter.remove(toastId)
  }, [])

  return { toasts, toast, dismiss }
}
