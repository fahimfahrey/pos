import type { CollectionName } from './driver'

export const COLLECTIONS: Record<CollectionName, string> = {
  // Catalog
  categories: 'catalog',
  catalogProducts: 'catalog',
  catalogProductVariants: 'catalog',
  priceLists: 'catalog',
  priceListEntries: 'catalog',
  // Inventory
  products: 'inventory',
  stockMovements: 'inventory',
  stockLevels: 'inventory',
  stocktakeSessions: 'inventory',
  stocktakeCounts: 'inventory',
  // Sales
  sales: 'sales',
  saleItems: 'sales',
  shifts: 'sales',
  parkedCarts: 'sales',
  receiptCounters: 'sales',
  // Payments
  payments: 'payments',
  refunds: 'payments',
  paymentStatusEvents: 'payments',
  // Customers
  customers: 'customers',
  storeCreditTransactions: 'customers',
  // Purchasing
  suppliers: 'purchasing',
  purchaseOrders: 'purchasing',
  purchaseOrderLines: 'purchasing',
  // Promotions
  promotions: 'promotions',
  // Organization
  organizations: 'organization',
  branches: 'organization',
  registers: 'organization',
  memberships: 'organization',
  branchAssignments: 'organization',
  invites: 'organization',
  // Auth
  users: 'auth',
  sessions: 'auth',
  // Audit
  auditEntries: 'audit',
  // System Enums
  systemEnumValues: 'system-enums',
}

export const CURRENT_SCHEMA_VERSION = 7
