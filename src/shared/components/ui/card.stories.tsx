import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card description</CardDescription>
      </CardHeader>
      <CardContent>Content goes here</CardContent>
      <CardFooter>
        <Button variant="secondary">Cancel</Button>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  ),
}

export const HeaderOnly: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Header Only Card</CardTitle>
      </CardHeader>
    </Card>
  ),
}

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent>Just content</CardContent>
    </Card>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Dark Theme Card</CardTitle>
      </CardHeader>
      <CardContent>Content in dark theme</CardContent>
    </Card>
  ),
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>কার্ড শিরোনাম</CardTitle>
        <CardDescription>এটি একটি কার্ড বর্ণনা</CardDescription>
      </CardHeader>
      <CardContent>কন্টেন্ট এখানে যায়</CardContent>
    </Card>
  ),
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
