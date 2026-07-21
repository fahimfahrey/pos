import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
import { Button } from './button'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>This is a tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const Sides: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top">Top tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right">Right tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Bottom tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Left</Button>
          </TooltipTrigger>
          <TooltipContent side="left">Left tooltip</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>Dark theme tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">উপর হন</Button>
        </TooltipTrigger>
        <TooltipContent>এটি একটি টুলটিপ</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
