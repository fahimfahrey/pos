import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab-1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab-3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">Content for tab 1</TabsContent>
      <TabsContent value="tab-2">Content for tab 2</TabsContent>
      <TabsContent value="tab-3">Content for tab 3</TabsContent>
    </Tabs>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="tab-1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab-2" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="tab-3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">Content for tab 1</TabsContent>
      <TabsContent value="tab-3">Content for tab 3</TabsContent>
    </Tabs>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <Tabs defaultValue="tab-1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab-1">Dark Tab 1</TabsTrigger>
        <TabsTrigger value="tab-2">Dark Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">Dark tab content</TabsContent>
      <TabsContent value="tab-2">More dark content</TabsContent>
    </Tabs>
  ),
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => (
    <Tabs defaultValue="tab-1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab-1">ট্যাব ১</TabsTrigger>
        <TabsTrigger value="tab-2">ট্যাব ২</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">ট্যাব ১ এর কন্টেন্ট</TabsContent>
      <TabsContent value="tab-2">ট্যাব ২ এর কন্টেন্ট</TabsContent>
    </Tabs>
  ),
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
