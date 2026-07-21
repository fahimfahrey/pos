'use client'

import { useRegisterSession } from '../_lib/use-register-session'
import { PosCartProvider } from '../_lib/pos-cart-context'
import { RegisterLayout } from './register-layout'
import { OpenShiftPanel } from './open-shift-panel'
import { ErrorState } from './error-state'

interface RegisterShellProps {
  orgId: string
  cashierId: string
  cashierName: string
  branchId: string
}

export function RegisterShell({
  orgId,
  cashierId,
  cashierName,
  branchId,
}: RegisterShellProps) {
  const session = useRegisterSession(orgId, branchId)

  if (session.status === 'loading') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto mb-4" />
          <p className="text-foreground">Loading register...</p>
        </div>
      </div>
    )
  }

  if (session.status === 'error') {
    return <ErrorState message={session.message} retry={session.retryLoad} />
  }

  if (session.status === 'needs-shift') {
    return (
      <PosCartProvider>
        <OpenShiftPanel
          register={session.register}
          cashierName={cashierName}
          onShiftOpened={session.openShift}
        />
      </PosCartProvider>
    )
  }

  // status === 'ready'
  return (
    <PosCartProvider>
      <RegisterLayout
        register={session.register}
        shift={session.shift}
        cashierId={cashierId}
        cashierName={cashierName}
        orgId={orgId}
      />
    </PosCartProvider>
  )
}
