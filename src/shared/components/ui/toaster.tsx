'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { Toast, ToastClose, ToastDescription, ToastTitle } from './toast'

export function Toaster() {
  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[var(--z-toast)] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:max-w-[420px]" />
    </ToastPrimitive.Provider>
  )
}
