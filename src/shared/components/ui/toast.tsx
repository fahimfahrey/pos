'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/cn'

const toastVariants = cva(
  'group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-[var(--radius-button)] border border-border p-4 pr-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full data-[state=open]:sm:slide-in-from-bottom-0',
  {
    variants: {
      variant: {
        default: 'bg-surface border-border text-foreground',
        success: 'bg-success border-success text-white',
        danger: 'bg-danger border-danger text-white',
        warning: 'bg-warning border-warning text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-surface focus:outline-none disabled:pointer-events-none disabled:opacity-50', className)}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close ref={ref} className={cn('absolute right-2 top-2 rounded-md p-1 text-foreground-muted opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100 group-focus:opacity-100', className)} toast-close="" {...props}>
    ×
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-label font-semibold', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-caption', className)} {...props} />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription }
