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
    <div
      className="h-dvh overflow-hidden overscroll-none pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      role="application"
    >
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
