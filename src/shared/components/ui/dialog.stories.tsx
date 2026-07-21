import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog'
import { Button } from './button'

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
}

export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>This is a dialog description</DialogDescription>
          </DialogHeader>
          <div className="py-4">Dialog content goes here</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}

export const ConfirmDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete Item</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}

export const DarkTheme: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dark Theme Dialog</DialogTitle>
          </DialogHeader>
          <div className="py-4">Dark theme content</div>
          <DialogFooter>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>খুলুন ডায়ালগ</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ডায়ালগ শিরোনাম</DialogTitle>
            <DialogDescription>এটি একটি ডায়ালগ বর্ণনা</DialogDescription>
          </DialogHeader>
          <div className="py-4">ডায়ালগ কন্টেন্ট এখানে যায়</div>
          <DialogFooter>
            <Button>নিশ্চিত করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
