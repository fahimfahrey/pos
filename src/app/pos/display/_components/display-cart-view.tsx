import type { CartSnapshot } from '@domains/sales/entities/cart-snapshot'

interface DisplayCartViewProps {
  cart: CartSnapshot | null
}

export function DisplayCartView({ cart }: DisplayCartViewProps) {
  if (!cart) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome</h1>
          <p className="text-2xl text-gray-400">No active sale</p>
        </div>
      </div>
    )
  }

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold">Current Order</h1>
      </div>

      {/* Line Items */}
      <div className="flex-1 overflow-auto mb-8">
        <div className="space-y-4">
          {cart.lines.map((line) => (
            <div key={line.variantId} className="flex justify-between items-center border-b border-gray-700 pb-4">
              <div className="flex-1">
                <div className="text-2xl font-semibold">{line.name}</div>
                <div className="text-lg text-gray-400">{line.sku}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{line.quantity}x</div>
                <div className="text-2xl font-bold text-green-400">{formatPrice(line.lineTotal)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-4 border-t border-gray-700 pt-8">
        {cart.discount > 0 && (
          <div className="flex justify-between text-2xl">
            <span className="text-gray-400">Discount:</span>
            <span className="text-red-400">-{formatPrice(cart.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-2xl">
          <span className="text-gray-400">Tax:</span>
          <span>{formatPrice(cart.tax)}</span>
        </div>

        <div className="flex justify-between text-4xl font-bold pt-4 border-t border-gray-700">
          <span>Total:</span>
          <span className="text-green-400">{formatPrice(cart.total)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-lg">
        Last updated: {new Date(cart.updatedAt).toLocaleTimeString()}
      </div>
    </div>
  )
}
