'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@shared/components/ui/badge'
import { Button } from '@shared/components/ui/button'
import { Spinner } from '@shared/components/ui/spinner'
import { useDelayedVisible } from '@shared/utils/motion'
import type { Payment } from '@domains/payments/entities/payment'
import { PAYMENT_STATUS } from '@constants/enums'

interface PaymentStatusViewProps {
  payment: Payment
  onRetry?: () => void
  onChangeMethod?: () => void
  onCancel?: () => void
}

export function PaymentStatusView({
  payment,
  onRetry,
  onChangeMethod,
  onCancel,
}: PaymentStatusViewProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const showSpinner = useDelayedVisible(payment.status === PAYMENT_STATUS.PENDING)

  useEffect(() => {
    if (payment.status !== PAYMENT_STATUS.PENDING) return

    const interval = setInterval(() => {
      setElapsedTime((t) => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [payment.status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (payment.status === PAYMENT_STATUS.PENDING) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-live="polite"
        aria-label="Payment processing"
      >
        <div className="flex items-center gap-3 justify-center p-4">
          {showSpinner && <Spinner size="sm" />}
          <span className="text-foreground font-semibold">Processing...</span>
        </div>

        <div className="text-center text-sm text-foreground">
          Elapsed: {formatTime(elapsedTime)}
        </div>

        <Button onClick={onRetry} variant="secondary" className="w-full h-12">
          Check Status
        </Button>
      </div>
    )
  }

  if (payment.status === PAYMENT_STATUS.FAILED) {
    return (
      <div
        className="space-y-4"
        role="alert"
        aria-live="assertive"
        aria-label="Payment failed"
      >
        <Badge variant="danger">Failed</Badge>

        {payment.failureReason && (
          <div className="bg-danger/10 border border-danger rounded p-3 text-sm text-foreground">
            {payment.failureReason}
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={onRetry} className="w-full h-12">
            Try Again
          </Button>
          <Button onClick={onChangeMethod} variant="secondary" className="w-full h-12">
            Use Different Method
          </Button>
          <Button onClick={onCancel} variant="destructive" className="w-full h-12">
            Cancel Sale
          </Button>
        </div>
      </div>
    )
  }

  if (payment.status === PAYMENT_STATUS.CAPTURED) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-live="polite"
        aria-label="Payment succeeded"
      >
        <Badge variant="success">Succeeded</Badge>

        <div className="text-center text-sm text-foreground">
          Payment processed successfully
        </div>
      </div>
    )
  }

  return null
}
