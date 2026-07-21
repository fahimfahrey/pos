'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/cn'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

const sheetVariants = cva(
  'fixed z-[var(--z-modal)] bg-surface shadow-lg transition-all',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:motion-sheet-top-exit data-[state=open]:motion-sheet-top-enter',
        bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:motion-sheet-bottom-exit data-[state=open]:motion-sheet-bottom-enter',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:motion-sheet-left-exit data-[state=open]:motion-sheet-left-enter',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:motion-sheet-right-exit data-[state=open]:motion-sheet-right-enter',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ side = 'right', className, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay)] data-[state=open]:motion-dialog-enter data-[state=closed]:motion-dialog-exit" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), 'border-border rounded-none', className)}
        {...props}
      />
    </DialogPrimitive.Portal>
  )
)
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 border-b border-border px-6 py-4', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex justify-end gap-2 border-t border-border px-6 py-4', className)} {...props} />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-display-lg font-display', className)} {...props} />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-body text-foreground-muted', className)} {...props} />
))
SheetDescription.displayName = DialogPrimitive.Description.displayName

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
