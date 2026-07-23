'use client'

import { useRegisterSession } from '../_lib/use-register-session'
import { PosCartProvider } from '../_lib/pos-cart-context'
import { RegisterLayout } from './register-layout'
import { OpenShiftPanel } from './open-shift-panel'
import { Skeleton } from '@shared/components/ui/skeleton'
import { RouteError } from '@shared/components/ui/route-error'

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
  const session = useRegisterSession(orgId, branchId, cashierId)

  if (session.status === 'loading') {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="h-14 bg-surface border-b border-border px-4 flex items-center">
          <Skeleton className="h-6 w-48 rounded" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-20 w-full rounded mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded" />
            <Skeleton className="h-16 w-full rounded" />
            <Skeleton className="h-16 w-full rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (session.status === 'error') {
    return <RouteError title="Error" message={session.message} kind="system" retry={session.retryLoad} />
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
