import type { CollectionName } from './driver'

export const COLLECTIONS: Record<CollectionName, string> = {
  // Catalog
  categories: 'catalog',
  catalogItems: 'catalog',
  // Inventory
  products: 'inventory',
  stockMovements: 'inventory',
  // Sales
  orders: 'sales',
  orderLines: 'sales',
  // Payments
  payments: 'payments',
  refunds: 'payments',
  // Customers
  customers: 'customers',
  // Purchasing
  suppliers: 'purchasing',
  purchaseOrders: 'purchasing',
  purchaseOrderLines: 'purchasing',
  // Promotions
  promotions: 'promotions',
  // Organization
  stores: 'organization',
  registers: 'organization',
  organizationSettings: 'organization',
  // Auth
  users: 'auth',
  sessions: 'auth',
  // Audit
  auditEntries: 'audit',
}

export const CURRENT_SCHEMA_VERSION = 1
