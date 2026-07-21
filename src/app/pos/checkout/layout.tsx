import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | POS',
  description: 'Register checkout screen',
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full overflow-hidden overscroll-none" role="application">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="scan-feedback-region"
      />
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="system-status-region"
      />
      {children}
    </div>
  )
}
