import { describe, it, expect } from 'vitest'
import { getNavItems, type NavItem } from './nav-items'
import type { Persona } from '@domains/auth/services/role-context'

describe('getNavItems', () => {
  describe('cashier persona', () => {
    it('shows only Home and Register', () => {
      const items = getNavItems('cashier')

      expect(items.map((i) => i.id)).toEqual(['home', 'register'])
    })

    it('does not include back-office items', () => {
      const items = getNavItems('cashier')
      const ids = items.map((i) => i.id)

      expect(ids).not.toContain('catalog')
      expect(ids).not.toContain('inventory')
      expect(ids).not.toContain('purchasing')
      expect(ids).not.toContain('customers')
      expect(ids).not.toContain('admin')
    })
  })

  describe('manager persona', () => {
    it('shows Home, back-office items, Register, and Admin', () => {
      const items = getNavItems('manager')
      const ids = items.map((i) => i.id)

      expect(ids).toEqual(['home', 'catalog', 'inventory', 'purchasing', 'customers', 'reports', 'register', 'admin'])
    })
  })

  describe('owner persona', () => {
    it('shows all items', () => {
      const items = getNavItems('owner')
      const ids = items.map((i) => i.id)

      expect(ids).toEqual(['home', 'catalog', 'inventory', 'purchasing', 'customers', 'reports', 'register', 'admin'])
    })
  })

  describe('auditor persona', () => {
    it('shows Home, back-office items, and Admin but no Register', () => {
      const items = getNavItems('auditor')
      const ids = items.map((i) => i.id)

      expect(ids).toEqual(['home', 'catalog', 'inventory', 'purchasing', 'customers', 'reports', 'admin'])
    })

    it('does not include register', () => {
      const items = getNavItems('auditor')
      const ids = items.map((i) => i.id)

      expect(ids).not.toContain('register')
    })
  })

  describe('nav item structure', () => {
    it('each nav item has required fields', () => {
      const items = getNavItems('manager')

      items.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('icon')
        expect(typeof item.id).toBe('string')
        expect(typeof item.label).toBe('string')
        expect(typeof item.href).toBe('string')
        expect(typeof item.icon).toBe('string')
      })
    })

    it('all hrefs start with / or http', () => {
      const items = getNavItems('owner')

      items.forEach((item) => {
        expect(item.href).toMatch(/^\/|^http/)
      })
    })
  })
})
