import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './sheet'
import { Button } from './button'

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
}

export default meta
type Story = StoryObj<typeof Sheet>

export const Right: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
          <div className="py-4">Sheet content</div>
          <SheetFooter>
            <Button>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  },
}

export const Left: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>Open Left Sheet</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
          </SheetHeader>
          <div className="py-4">Content slides in from left</div>
        </SheetContent>
      </Sheet>
    )
  },
}

export const Bottom: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>Open Bottom Sheet</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
          </SheetHeader>
          <div className="py-4">Content slides in from bottom</div>
        </SheetContent>
      </Sheet>
    )
  },
}

export const DarkTheme: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Dark Theme Sheet</SheetTitle>
          </SheetHeader>
          <div className="py-4">Dark theme sheet content</div>
        </SheetContent>
      </Sheet>
    )
  },
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>শীট খুলুন</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>শীট শিরোনাম</SheetTitle>
            <SheetDescription>শীট বর্ণনা</SheetDescription>
          </SheetHeader>
          <div className="py-4">শীট কন্টেন্ট</div>
        </SheetContent>
      </Sheet>
    )
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
