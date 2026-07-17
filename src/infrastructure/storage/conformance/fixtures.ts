import type { RepositorySet } from '@infra/storage'
import type { Product, StockLevel } from '@domains/inventory/entities/product'
import type { StockMovement } from '@domains/inventory/entities/stock-movement'
import type { Order, OrderLine } from '@domains/sales/entities/order'
import type { Category, CatalogItem } from '@domains/catalog/entities/catalog-item'
import type { Payment, Refund } from '@domains/payments/entities/payment'
import type { Customer } from '@domains/customers/entities/customer'
import type { Supplier } from '@domains/purchasing/entities/supplier'
import type { PurchaseOrder, PurchaseOrderLine } from '@domains/purchasing/entities/purchase-order'
import type { Promotion } from '@domains/promotions/entities/promotion'
import type { Organization } from '@domains/organization/entities/organization'
import type { Branch } from '@domains/organization/entities/branch'
import type { Register } from '@domains/organization/entities/register'
import type { Membership } from '@domains/organization/entities/membership'
import type { BranchAssignment } from '@domains/organization/entities/branch-assignment'
import type { Invite } from '@domains/organization/entities/invite'
import type { User, Session } from '@domains/auth/entities/user'
import type { AuditEntry } from '@domains/audit/entities/audit-entry'

const FIXED_DATE = new Date('2024-01-15T10:30:00Z')

export interface FixtureOverrides {
  id?: string
  orgId?: string
  [key: string]: unknown
}

// Inventory

export function makeProduct(overrides?: FixtureOverrides & Partial<Product>): Product {
  const id = overrides?.id ?? 'product-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    name: 'Test Product',
    sku: overrides?.sku ?? `SKU-${id}`,
    price: { amount: 99.99, currency: 'USD' },
    stock: { quantity: 100, unit: 'unit' } as StockLevel,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeStockMovement(overrides?: FixtureOverrides & Partial<StockMovement>): StockMovement {
  const id = overrides?.id ?? 'movement-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    productId: 'product-001',
    quantity: 10,
    movementType: 'in',
    reason: 'Stock adjustment',
    createdAt: FIXED_DATE,
    createdBy: 'admin',
    ...rest,
  }
}

// Sales

export function makeOrder(overrides?: FixtureOverrides & Partial<Order>): Order {
  const id = overrides?.id ?? 'order-001'
  const { id: _id, ...rest } = overrides ?? {}
  const line: OrderLine = {
    id: 'line-001',
    productId: 'product-001',
    quantity: 2,
    unitPrice: { amount: 99.99, currency: 'USD' },
    subtotal: { amount: 199.98, currency: 'USD' },
  }
  return {
    id,
    status: 'open',
    lines: [line],
    total: { amount: 199.98, currency: 'USD' },
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

// Catalog

export function makeCategory(overrides?: FixtureOverrides & Partial<Category>): Category {
  const id = overrides?.id ?? 'category-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    name: 'Test Category',
    description: 'A test category',
    active: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeCatalogItem(overrides?: FixtureOverrides & Partial<CatalogItem>): CatalogItem {
  const id = overrides?.id ?? 'catalog-item-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    productId: 'product-001',
    categoryId: 'category-001',
    sku: 'SKU-CAT-001',
    barcode: '1234567890123',
    name: 'Catalog Item',
    description: 'A test catalog item',
    active: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

// Payments

export function makePayment(overrides?: FixtureOverrides & Partial<Payment>): Payment {
  const id = overrides?.id ?? 'payment-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    orderId: 'order-001',
    amount: 199.98,
    currency: 'USD',
    method: 'card',
    status: 'completed',
    transactionId: 'txn-123',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeRefund(overrides?: FixtureOverrides & Partial<Refund>): Refund {
  const id = overrides?.id ?? 'refund-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    paymentId: 'payment-001',
    amount: 50.0,
    reason: 'Customer request',
    status: 'completed',
    createdAt: FIXED_DATE,
    completedAt: FIXED_DATE,
    ...rest,
  }
}

// Customers

export function makeCustomer(overrides?: FixtureOverrides & Partial<Customer>): Customer {
  const id = overrides?.id ?? 'customer-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    email: 'customer@test.com',
    phone: '+1234567890',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'Springfield',
    zipCode: '12345',
    country: 'USA',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

// Purchasing

export function makeSupplier(overrides?: FixtureOverrides & Partial<Supplier>): Supplier {
  const id = overrides?.id ?? 'supplier-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    name: 'Test Supplier',
    email: 'supplier@test.com',
    phone: '+1234567890',
    address: '456 Supply Ave',
    city: 'Warehouse City',
    zipCode: '54321',
    country: 'USA',
    active: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makePurchaseOrder(overrides?: FixtureOverrides & Partial<PurchaseOrder>): PurchaseOrder {
  const id = overrides?.id ?? 'po-001'
  const { id: _id, ...rest } = overrides ?? {}
  const line: PurchaseOrderLine = {
    id: 'po-line-001',
    productId: 'product-001',
    quantity: 50,
    unitPrice: 50.0,
    receivedQuantity: 0,
  }
  return {
    id,
    supplierId: 'supplier-001',
    status: 'submitted',
    lines: [line],
    total: 2500.0,
    currency: 'USD',
    expectedDeliveryDate: new Date('2024-02-15'),
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

// Promotions

export function makePromotion(overrides?: FixtureOverrides & Partial<Promotion>): Promotion {
  const id = overrides?.id ?? 'promotion-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    code: 'SUMMER20',
    kind: 'percentage_discount',
    value: 20,
    currency: 'USD',
    active: true,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    maxUsages: 100,
    usageCount: 0,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

// Organization

export function makeOrganization(overrides?: FixtureOverrides & Partial<Organization>): Organization {
  const id = overrides?.id ?? 'org-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    name: 'Test Organization',
    slug: 'test-org',
    plan: 'free',
    status: 'active',
    settings: {},
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeBranch(overrides?: FixtureOverrides & Partial<Branch>): Branch {
  const id = overrides?.id ?? 'branch-001'
  const { id: _id, orgId: _orgId, ...rest } = overrides ?? {}
  const orgId = overrides?.orgId ?? 'org-001'
  return {
    id,
    orgId,
    name: 'Test Branch',
    code: 'BRANCH-001',
    address: '789 Store Lane',
    city: 'Retail City',
    zipCode: '99999',
    country: 'USA',
    phone: '+1987654321',
    email: 'branch@test.com',
    timezone: 'America/New_York',
    settings: {},
    active: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeRegister(overrides?: FixtureOverrides & Partial<Register>): Register {
  const id = overrides?.id ?? 'register-001'
  const { id: _id, orgId: _orgId, ...rest } = overrides ?? {}
  const orgId = overrides?.orgId ?? 'org-001'
  const branchId = overrides?.branchId ?? 'branch-001'
  return {
    id,
    orgId,
    branchId,
    number: 'REG-001',
    name: 'Main Register',
    active: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeMembership(overrides?: FixtureOverrides & Partial<Membership>): Membership {
  const id = overrides?.id ?? 'membership-001'
  const { id: _id, orgId: _orgId, ...rest } = overrides ?? {}
  const orgId = overrides?.orgId ?? 'org-001'
  return {
    id,
    orgId,
    userId: 'user-001',
    role: 1, // OWNER
    status: 'active',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeBranchAssignment(overrides?: FixtureOverrides & Partial<BranchAssignment>): BranchAssignment {
  const id = overrides?.id ?? 'assignment-001'
  const { id: _id, orgId: _orgId, ...rest } = overrides ?? {}
  const orgId = overrides?.orgId ?? 'org-001'
  return {
    id,
    orgId,
    membershipId: 'membership-001',
    branchId: 'branch-001',
    createdAt: FIXED_DATE,
    ...rest,
  }
}

export function makeInvite(overrides?: FixtureOverrides & Partial<Invite>): Invite {
  const id = overrides?.id ?? 'invite-001'
  const { id: _id, orgId: _orgId, ...rest } = overrides ?? {}
  const orgId = overrides?.orgId ?? 'org-001'
  return {
    id,
    orgId,
    email: 'newuser@test.com',
    role: 3, // MEMBER
    branchIds: ['branch-001'],
    token: 'invite-token-abc123',
    status: 'pending',
    invitedBy: 'user-001',
    expiresAt: new Date('2024-02-15'),
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

// Auth

export function makeUser(overrides?: FixtureOverrides & Partial<User>): User {
  const id = overrides?.id ?? 'user-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    username: 'testuser',
    email: 'user@test.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    active: true,
    roles: ['admin'],
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...rest,
  }
}

export function makeSession(overrides?: FixtureOverrides & Partial<Session>): Session {
  const id = overrides?.id ?? 'session-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    userId: 'user-001',
    token: 'session-token-abc123',
    expiresAt: new Date('2024-02-15'),
    createdAt: FIXED_DATE,
    ...rest,
  }
}

// Audit

export function makeAuditEntry(overrides?: FixtureOverrides & Partial<AuditEntry>): AuditEntry {
  const id = overrides?.id ?? 'audit-001'
  const { id: _id, ...rest } = overrides ?? {}
  return {
    id,
    entityType: 'Product',
    entityId: 'product-001',
    action: 'created',
    actorId: 'user-001',
    changes: { name: 'Test Product' },
    createdAt: FIXED_DATE,
    ...rest,
  }
}

/**
 * Seed all entity types into the repository set.
 * Creates one instance of each entity type with optional orgId for tenant scoping.
 */
export async function seedAll(repos: RepositorySet, opts?: { orgId?: string }): Promise<void> {
  const orgId = opts?.orgId ?? 'org-default'

  // Inventory
  await repos.inventory.save(makeProduct({ id: 'product-001', orgId }))
  await repos.inventory.recordMovement(makeStockMovement({ id: 'movement-001', productId: 'product-001', orgId }))

  // Sales
  await repos.sales.save(makeOrder({ id: 'order-001', orgId }))

  // Catalog
  await repos.catalog.saveCategory(makeCategory({ id: 'category-001', orgId }))
  await repos.catalog.saveItem(makeCatalogItem({ id: 'catalog-item-001', orgId }))

  // Payments
  await repos.payments.savePayment(makePayment({ id: 'payment-001', orgId }))
  await repos.payments.saveRefund(makeRefund({ id: 'refund-001', paymentId: 'payment-001', orgId }))

  // Customers
  await repos.customers.save(makeCustomer({ id: 'customer-001', orgId }))

  // Purchasing
  await repos.purchasing.saveSupplier(makeSupplier({ id: 'supplier-001', orgId }))
  await repos.purchasing.savePurchaseOrder(makePurchaseOrder({ id: 'po-001', supplierId: 'supplier-001', orgId }))

  // Promotions
  await repos.promotions.save(makePromotion({ id: 'promotion-001', orgId }))

  // Organization
  await repos.organization.saveOrganization(makeOrganization({ id: 'org-001', orgId }))
  await repos.organization.saveBranch(makeBranch({ id: 'branch-001', orgId }))
  await repos.organization.saveRegister(makeRegister({ id: 'register-001', orgId, branchId: 'branch-001' }))
  await repos.organization.saveMembership(makeMembership({ id: 'membership-001', orgId }))
  await repos.organization.saveBranchAssignment(makeBranchAssignment({ id: 'assignment-001', orgId }))
  await repos.organization.saveInvite(makeInvite({ id: 'invite-001', orgId }))

  // Auth
  await repos.auth.saveUser(makeUser({ id: 'user-001', orgId }))
  await repos.auth.saveSession(makeSession({ id: 'session-001', userId: 'user-001', orgId }))

  // Audit
  await repos.audit.append(makeAuditEntry({ id: 'audit-001', orgId }))
}
