import type { Meta, StoryObj } from '@storybook/react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter } from './table'

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
}

export default meta
type Story = StoryObj<typeof Table>

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell className="text-right tabular-nums">$100.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell className="text-right tabular-nums">$250.50</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob Johnson</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell className="text-right tabular-nums">$75.25</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right tabular-nums">$425.75</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const Simple: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Item 1</TableCell>
          <TableCell className="tabular-nums">10</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Item 2</TableCell>
          <TableCell className="tabular-nums">5</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Item A</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Item B</TableCell>
          <TableCell>Inactive</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  parameters: {
    theme: 'dark',
  },
}

export const DarkBengali: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>নাম</TableHead>
          <TableHead>মূল্য</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>আইটেম ১</TableCell>
          <TableCell className="text-right tabular-nums">৫০০ টাকা</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>আইটেম ২</TableCell>
          <TableCell className="text-right tabular-nums">৮০০ টাকা</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  parameters: {
    theme: 'dark',
    locale: 'bn',
  },
}
