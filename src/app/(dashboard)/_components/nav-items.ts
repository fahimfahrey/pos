import type { Persona } from '@domains/auth/services/role-context'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string // icon name/key for rendering
}

/**
 * Compute the nav items visible to each persona.
 * Cashier: Home, Register only (no catalog/inventory/purchasing/customers)
 * Manager: Home, Catalog, Inventory, Purchasing, Customers, Register, Admin (if has admin role)
 * Owner: All items
 * Auditor: Home, Catalog, Inventory, Purchasing, Customers, Admin (audit only)
 */
export function getNavItems(persona: Persona): NavItem[] {
  const baseItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/app',
      icon: 'home',
    },
  ]

  const backOfficeItems: NavItem[] = [
    {
      id: 'catalog',
      label: 'Catalog',
      href: '/app/catalog',
      icon: 'box',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      href: '/app/inventory',
      icon: 'package',
    },
    {
      id: 'purchasing',
      label: 'Purchasing',
      href: '/app/purchasing',
      icon: 'truck',
    },
    {
      id: 'customers',
      label: 'Customers',
      href: '/app/customers',
      icon: 'users',
    },
  ]

  const registerItem: NavItem = {
    id: 'register',
    label: 'Register',
    href: '/pos/checkout',
    icon: 'credit-card',
  }

  const adminItem: NavItem = {
    id: 'admin',
    label: 'Admin',
    href: '/admin',
    icon: 'settings',
  }

  switch (persona) {
    case 'owner':
      return [...baseItems, ...backOfficeItems, registerItem, adminItem]
    case 'manager':
      return [...baseItems, ...backOfficeItems, registerItem, adminItem]
    case 'cashier':
      return [baseItems[0], registerItem] // Only Home + Register
    case 'auditor':
      return [...baseItems, ...backOfficeItems, adminItem]
    default:
      return baseItems
  }
}
