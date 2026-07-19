'use client'

import { useEffect, useRef, useCallback } from 'react'
import { BrowserBroadcastChannel } from '@infra/adapters/browser-broadcast-channel'
import type { CartSnapshot } from '@domains/sales/entities/cart-snapshot'

/**
 * Hook for broadcasting cart state across browser tabs/windows.
 * Provides publish() to send cart updates and subscribe() to receive them.
 * Channel is scoped per registerId to prevent cross-register interference.
 */
export function useCartBroadcast(registerId: string) {
  const channelRef = useRef<BrowserBroadcastChannel<CartSnapshot> | null>(null)

  // Initialize channel on mount, clean up on unmount
  useEffect(() => {
    const channelName = `pos-cart-${registerId}`
    channelRef.current = new BrowserBroadcastChannel<CartSnapshot>(channelName)

    return () => {
      if (channelRef.current) {
        channelRef.current.close()
        channelRef.current = null
      }
    }
  }, [registerId])

  const publish = useCallback((snapshot: CartSnapshot) => {
    if (channelRef.current) {
      channelRef.current.publish(snapshot)
    }
  }, [])

  const subscribe = useCallback((handler: (snapshot: CartSnapshot) => void) => {
    if (!channelRef.current) {
      return () => {}
    }
    return channelRef.current.subscribe(handler)
  }, [])

  return {
    publish,
    subscribe,
  }
}
