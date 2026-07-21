'use client'

import { useEffect, useState } from 'react'
import { createDefaultStorageProvider } from '@infra/storage'
import { RegisterService } from '@domains/organization/services/register-service'
import { ShiftService } from '@domains/sales/services/shift-service'
import { SystemClock } from '@domains/system/services/clock'
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
  branchId: string
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
        const provider = createDefaultStorageProvider()
        const repos = await provider.getRepositorySet()
        const clock = new SystemClock()

        // Auto-select register from localStorage or use first active
        let registerId = localStorage.getItem(`${REGISTER_ID_KEY}-${branchId}`)

        if (!registerId) {
          const registers = await repos.organization.listRegistersForBranch(branchId)
          const activeRegister = registers.find((r) => r.active)

          if (!activeRegister) {
            if (isMounted) {
              setState({
                status: 'error',
                message: 'No active registers found for this branch',
              })
            }
            return
          }

          registerId = activeRegister.id
          localStorage.setItem(`${REGISTER_ID_KEY}-${branchId}`, registerId)
        }

        const register = await repos.organization.findRegisterById(registerId)
        if (!register) {
          if (isMounted) {
            setState({
              status: 'error',
              message: 'Register not found',
            })
          }
          return
        }

        // Look for open shift
        const shiftService = new ShiftService(repos.sales, clock)
        const openShift = await shiftService.getOpenShiftForRegister(registerId)

        if (isMounted) {
          if (openShift) {
            setState({
              status: 'ready',
              register,
              shift: openShift,
            })
          } else {
            setState({
              status: 'needs-shift',
              register,
            })
          }
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

    try {
      const provider = createDefaultStorageProvider()
      const repos = await provider.getRepositorySet()
      const clock = new SystemClock()
      const shiftService = new ShiftService(repos.sales, clock)

      const newShift = await shiftService.openShift(state.register.id, floatAmount)

      setState({
        status: 'ready',
        register: state.register,
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
