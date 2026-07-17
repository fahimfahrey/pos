import type Dexie from 'dexie'
import { COLLECTIONS, CURRENT_SCHEMA_VERSION } from '../../core/schema'
import type { CollectionName } from '../../core/driver'

export const META_STORE = '__meta__'
export const SCHEMA_VERSION_KEY = 'schemaVersion'

/**
 * Dexie index strings for each collection, mirroring repository access patterns.
 * Format: 'primaryKey, index1, index2, [compoundIndex1+compoundIndex2]'
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

  // Organization
  stores: 'id, orgId',
  registers: 'id, storeId, active',
  organizationSettings: 'id, key',

  // Auth
  users: 'id, username, email',
  sessions: 'id, userId, expiresAt',

  // Audit
  auditEntries: 'id, entityType, entityId, actorId, createdAt',
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
 * Wire up the Dexie version chain from CURRENT_SCHEMA_VERSION.
 * When a future SchemaStep requires structural changes (new store/index),
 * append db.version(n).stores({...}) and bump CURRENT_SCHEMA_VERSION.
 */
export function buildVersionChain(db: Dexie): void {
  db.version(CURRENT_SCHEMA_VERSION).stores(buildStoresSpec())
}
