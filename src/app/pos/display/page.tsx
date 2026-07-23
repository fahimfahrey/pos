'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartBroadcast } from '../_lib/use-cart-broadcast'
import { DisplayCartView } from './_components/display-cart-view'
import type { CartSnapshot } from '@domains/sales/entities/cart-snapshot'

export default function DisplayPage() {
  const searchParams = useSearchParams()
  const registerId = searchParams.get('registerId') || ''
  const [cart, setCart] = useState<CartSnapshot | null>(null)

  const cartBroadcast = useCartBroadcast(registerId)

  useEffect(() => {
    if (!registerId) {
      return
    }

    // Subscribe to cart updates
    const unsubscribe = cartBroadcast.subscribe((snapshot) => {
      setCart(snapshot)
    })

    return unsubscribe
  }, [registerId, cartBroadcast])

  if (!registerId) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Customer Display</h1>
          <p className="text-xl text-gray-400">
            Please access this page with a registerId parameter
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Example: /pos/display?registerId=register-1
          </p>
        </div>
      </div>
    )
  }

  return <DisplayCartView cart={cart} />
}
