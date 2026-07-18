import type Dexie from 'dexie'
import { COLLECTIONS, CURRENT_SCHEMA_VERSION } from '../../core/schema'
import type { CollectionName } from '../../core/driver'

export const META_STORE = '__meta__'
export const SCHEMA_VERSION_KEY = 'schemaVersion'

const V1_STORES_SPEC: Record<string, string> = {
  // Catalog
  categories: 'id, active',
  catalogItems: 'id, sku, barcode, categoryId, active, createdAt',
  // Inventory
  products: 'id, sku, createdAt, orgId, [orgId+branchId]',
  stockMovements: 'id, productId, createdAt',
  // Sales
  orders: 'id, status, createdAt, orgId, shiftId, [orgId+branchId]',
  orderLines: 'id, orderId',
  // Payments (orderId is the saleId per the card)
  payments: 'id, orderId, status, createdAt, shiftId',
  refunds: 'id, paymentId, createdAt',
  // Customers
  customers: 'id, email, phone, createdAt, orgId',
  // Purchasing
  suppliers: 'id, active',
  purchaseOrders: 'id, supplierId, status, createdAt',
  purchaseOrderLines: 'id, purchaseOrderId',
  // Promotions
  promotions: 'id, code, active',
  // Organization (v1)
  stores: 'id, orgId',
  registers: 'id, storeId, active',
  organizationSettings: 'id, key',
  // Auth
  users: 'id, username, email',
  sessions: 'id, userId, expiresAt',
  // Audit
  auditEntries: 'id, entityType, entityId, actorId, createdAt',
  [META_STORE]: 'id',
}

/**
 * Dexie index strings for each collection, mirroring repository access patterns.
 * Format: 'primaryKey, index1, index2, [compoundIndex1+compoundIndex2]'
 * These are the v2 indexes (current/live schema).
 */
export const COLLECTION_INDEXES: Record<CollectionName, string> = {
  // Catalog
  categories: 'id, active',
  catalogItems: 'id, sku, barcode, categoryId, active, createdAt',

  // Inventory
  products: 'id, sku, createdAt, orgId, [orgId+branchId]',
  stockMovements: 'id, productId, createdAt',

  // Sales
  orders: 'id, status, createdAt, orgId, shiftId, [orgId+branchId]',
  orderLines: 'id, orderId',

  // Payments (orderId is the saleId per the card)
  payments: 'id, orderId, status, createdAt, shiftId',
  refunds: 'id, paymentId, createdAt',

  // Customers
  customers: 'id, email, phone, createdAt, orgId',

  // Purchasing
  suppliers: 'id, active',
  purchaseOrders: 'id, supplierId, status, createdAt',
  purchaseOrderLines: 'id, purchaseOrderId',

  // Promotions
  promotions: 'id, code, active',

  // Organization (v2)
  organizations: 'id, slug, status',
  branches: 'id, orgId',
  registers: 'id, orgId, branchId, active',
  memberships: 'id, orgId, userId, [orgId+userId]',
  branchAssignments: 'id, orgId, branchId, membershipId, [membershipId+branchId]',
  invites: 'id, orgId, token, email, status',

  // Auth
  users: 'id, username, email',
  sessions: 'id, userId, expiresAt',

  // Audit
  auditEntries: 'id, entityType, entityId, actorId, createdAt',

  // System Enums
  systemEnumValues: 'id, orgId, registryKey, [orgId+registryKey], value',
}

/**
 * Build the complete Dexie stores specification, including the meta store.
 */
export function buildStoresSpec(): Record<string, string> {
  return {
    ...COLLECTION_INDEXES,
    [META_STORE]: 'id',
  }
}

/**
 * Wire up the Dexie version chain.
 * Version 1 (v1) is frozen for historical compatibility; version 2 (v2) is current.
 * Fresh databases open at v2; existing v1 databases upgrade through this chain.
 */
export function buildVersionChain(db: Dexie): void {
  // Freeze v1 spec (historical snapshot)
  db.version(1).stores(V1_STORES_SPEC)
  // Version 2: drop v1 collections, add new organization collections
  db.version(2).stores({
    stores: null, // drop
    organizationSettings: null, // drop
    registers: 'id, orgId, branchId, active', // re-index
    organizations: 'id, slug, status', // new
    branches: 'id, orgId', // new
    memberships: 'id, orgId, userId, [orgId+userId]', // new
    branchAssignments: 'id, orgId, branchId, membershipId, [membershipId+branchId]', // new
    invites: 'id, orgId, token, email, status', // new
    [META_STORE]: 'id', // preserved
  })
  // Version 3: add systemEnumValues collection for org-level runtime enum extensibility
  db.version(3).stores({
    systemEnumValues: 'id, orgId, registryKey, [orgId+registryKey], value',
  })
}
