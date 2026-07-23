'use client'

import { useEffect, useState } from 'react'
import { createDefaultStorageProvider } from '@infra/storage'
import { ShiftService } from '@domains/sales/services/shift-service'
import { SystemClock } from '@infra/adapters/system-clock'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import type { Register } from '@domains/organization/entities/register'
import type { Shift } from '@domains/sales/entities/shift'

const REGISTER_ID_KEY = 'pos-active-register-id'

type RegisterSessionState =
  | { status: 'loading' }
  | { status: 'needs-shift'; register: Register }
  | { status: 'ready'; register: Register; shift: Shift }
  | { status: 'error'; message: string }

export function useRegisterSession(
  orgId: string,
  branchId: string,
  cashierId: string,
): RegisterSessionState & {
  openShift: (floatAmount: number) => Promise<void>
  retryLoad: () => void
} {
  const [state, setState] = useState<RegisterSessionState>({ status: 'loading' })
  const [retryCount, setRetryCount] = useState(0)

  const retryLoad = () => setRetryCount((c) => c + 1)

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const provider = await createDefaultStorageProvider()
        const clock = new SystemClock()
        const storedRegisterId = localStorage.getItem(`${REGISTER_ID_KEY}-${branchId}`)

        const result = await provider.withTransaction(async (repos) => {
          let registerId = storedRegisterId

          if (!registerId) {
            const registers = await repos.organization.listRegistersForBranch(branchId)
            const activeRegister = registers.find((r) => r.active)

            if (!activeRegister) {
              return { kind: 'error' as const, message: 'No active registers found for this branch' }
            }

            registerId = activeRegister.id
            localStorage.setItem(`${REGISTER_ID_KEY}-${branchId}`, registerId)
          }

          const register = await repos.organization.findRegisterById(registerId)
          if (!register) {
            return { kind: 'error' as const, message: 'Register not found' }
          }

          const shiftService = new ShiftService(clock, new UuidIdGenerator())
          const openShift = await shiftService.getOpenShiftForRegister({ sales: repos.sales }, register.id)

          return { kind: 'ready' as const, register, shift: openShift }
        })

        if (!isMounted) return

        if (result.kind === 'error') {
          setState({ status: 'error', message: result.message })
        } else if (result.shift) {
          setState({ status: 'ready', register: result.register, shift: result.shift })
        } else {
          setState({ status: 'needs-shift', register: result.register })
        }
      } catch (error) {
        console.error('Failed to bootstrap register session:', error)
        if (isMounted) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    bootstrap()

    return () => {
      isMounted = false
    }
  }, [orgId, branchId, retryCount])

  const openShift = async (floatAmount: number) => {
    if (state.status !== 'needs-shift') {
      return
    }

    const currentRegister = state.register

    try {
      const provider = await createDefaultStorageProvider()
      const clock = new SystemClock()
      const shiftService = new ShiftService(clock, new UuidIdGenerator())

      const newShift = await provider.withTransaction((repos) =>
        shiftService.openShift(
          { sales: repos.sales },
          {
            orgId,
            branchId,
            registerId: currentRegister.id,
            cashierUserId: cashierId,
            floatAmount,
          },
        ),
      )

      setState({
        status: 'ready',
        register: currentRegister,
        shift: newShift,
      })
    } catch (error) {
      console.error('Failed to open shift:', error)
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to open shift',
      })
    }
  }

  return {
    ...state,
    openShift,
    retryLoad,
  }
}
