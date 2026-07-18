import { describe, it, expect } from 'vitest'
import type { StorageProvider } from '@infra/storage'
import * as fixtures from '../fixtures'

export function runCrudSuite(getProvider: () => StorageProvider): void {
  describe('CRUD round-trips', () => {
    describe('inventory', () => {
      it('should save and find product by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const product = fixtures.makeProduct({ id: 'p1' })
          await repos.inventory.save(product)
          const found = await repos.inventory.findById('p1')
          expect(found).toEqual(product)
        })
      })

      it('should return null for missing product', async () => {
        await getProvider().withTransaction(async (repos) => {
          const found = await repos.inventory.findById('missing')
          expect(found).toBeNull()
        })
      })

      it('should list all products', async () => {
        await getProvider().withTransaction(async (repos) => {
          const p1 = fixtures.makeProduct({ id: 'p1' })
          const p2 = fixtures.makeProduct({ id: 'p2' })
          await repos.inventory.save(p1)
          await repos.inventory.save(p2)
          const all = await repos.inventory.listAll()
          expect(all).toContainEqual(p1)
          expect(all).toContainEqual(p2)
        })
      })

      it('should find product by sku', async () => {
        await getProvider().withTransaction(async (repos) => {
          const product = fixtures.makeProduct({ id: 'p1', sku: 'UNIQUE-SKU' })
          await repos.inventory.save(product)
          const found = await repos.inventory.findBySku('UNIQUE-SKU')
          expect(found).toEqual(product)
        })
      })

      it('should record and list stock movements', async () => {
        await getProvider().withTransaction(async (repos) => {
          const product = fixtures.makeProduct({ id: 'p1' })
          await repos.inventory.save(product)
          const movement = fixtures.makeStockMovement({
            id: 'm1',
            productId: 'p1',
          })
          await repos.inventory.recordMovement(movement)
          const movements = await repos.inventory.listMovements('p1')
          expect(movements).toContainEqual(movement)
        })
      })
    })

    describe('sales', () => {
      it('should save and find order by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const order = fixtures.makeOrder({ id: 'o1' })
          await repos.sales.save(order)
          const found = await repos.sales.findById('o1')
          expect(found).toEqual(order)
        })
      })

      it('should return null for missing order', async () => {
        await getProvider().withTransaction(async (repos) => {
          const found = await repos.sales.findById('missing')
          expect(found).toBeNull()
        })
      })

      it('should list open orders', async () => {
        await getProvider().withTransaction(async (repos) => {
          const order = fixtures.makeOrder({ id: 'o1', status: 'open' })
          await repos.sales.save(order)
          const open = await repos.sales.listOpen()
          expect(open).toContainEqual(order)
        })
      })

      it('should list orders by status', async () => {
        await getProvider().withTransaction(async (repos) => {
          const order = fixtures.makeOrder({ id: 'o1', status: 'paid' })
          await repos.sales.save(order)
          const paid = await repos.sales.listByStatus('paid')
          expect(paid).toContainEqual(order)
        })
      })

      it('should list orders by date range', async () => {
        await getProvider().withTransaction(async (repos) => {
          const order = fixtures.makeOrder({ id: 'o1' })
          await repos.sales.save(order)
          const from = new Date('2024-01-01')
          const to = new Date('2024-12-31')
          const inRange = await repos.sales.listByDateRange(from, to)
          expect(inRange).toContainEqual(order)
        })
      })
    })

    describe('catalog', () => {
      it('should save and find category by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const category = fixtures.makeCategory({ id: 'c1' })
          await repos.catalog.saveCategory(category)
          const found = await repos.catalog.findCategoryById('c1')
          expect(found).toEqual(category)
        })
      })

      it('should list all categories', async () => {
        await getProvider().withTransaction(async (repos) => {
          const category = fixtures.makeCategory({ id: 'c1' })
          await repos.catalog.saveCategory(category)
          const all = await repos.catalog.listCategories()
          expect(all).toContainEqual(category)
        })
      })

      it('should save and find catalog item by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const item = fixtures.makeCatalogItem({ id: 'ci1' })
          await repos.catalog.saveItem(item)
          const found = await repos.catalog.findItemById('ci1')
          expect(found).toEqual(item)
        })
      })

      it('should find catalog item by sku', async () => {
        await getProvider().withTransaction(async (repos) => {
          const item = fixtures.makeCatalogItem({ id: 'ci1', sku: 'ITEM-SKU' })
          await repos.catalog.saveItem(item)
          const found = await repos.catalog.findItemBySku('ITEM-SKU')
          expect(found).toEqual(item)
        })
      })

      it('should find catalog item by barcode', async () => {
        await getProvider().withTransaction(async (repos) => {
          const item = fixtures.makeCatalogItem({
            id: 'ci1',
            barcode: '9876543210',
          })
          await repos.catalog.saveItem(item)
          const found = await repos.catalog.findItemByBarcode('9876543210')
          expect(found).toEqual(item)
        })
      })

      it('should list active items', async () => {
        await getProvider().withTransaction(async (repos) => {
          const item = fixtures.makeCatalogItem({ id: 'ci1', active: true })
          await repos.catalog.saveItem(item)
          const active = await repos.catalog.listActiveItems()
          expect(active).toContainEqual(item)
        })
      })

      it('should list items by category', async () => {
        await getProvider().withTransaction(async (repos) => {
          const item = fixtures.makeCatalogItem({
            id: 'ci1',
            categoryId: 'c1',
          })
          await repos.catalog.saveItem(item)
          const items = await repos.catalog.listItemsByCategory('c1')
          expect(items).toContainEqual(item)
        })
      })

      it('should search items by name', async () => {
        await getProvider().withTransaction(async (repos) => {
          const item = fixtures.makeCatalogItem({
            id: 'ci1',
            name: 'Test Product Name',
          })
          await repos.catalog.saveItem(item)
          const results = await repos.catalog.searchItemsByName('Test')
          expect(results).toContainEqual(item)
        })
      })
    })

    describe('payments', () => {
      it('should save and find payment by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const payment = fixtures.makePayment({ id: 'pay1' })
          await repos.payments.savePayment(payment)
          const found = await repos.payments.findPaymentById('pay1')
          expect(found).toEqual(payment)
        })
      })

      it('should list payments for order', async () => {
        await getProvider().withTransaction(async (repos) => {
          const payment = fixtures.makePayment({
            id: 'pay1',
            orderId: 'o1',
          })
          await repos.payments.savePayment(payment)
          const payments = await repos.payments.listPaymentsForOrder('o1')
          expect(payments).toContainEqual(payment)
        })
      })

      it('should list payments by date range', async () => {
        await getProvider().withTransaction(async (repos) => {
          const payment = fixtures.makePayment({ id: 'pay1' })
          await repos.payments.savePayment(payment)
          const from = new Date('2024-01-01')
          const to = new Date('2024-12-31')
          const inRange = await repos.payments.listPaymentsByDateRange(from, to)
          expect(inRange).toContainEqual(payment)
        })
      })

      it('should save and list refunds for payment', async () => {
        await getProvider().withTransaction(async (repos) => {
          const refund = fixtures.makeRefund({
            id: 'ref1',
            paymentId: 'pay1',
          })
          await repos.payments.saveRefund(refund)
          const refunds = await repos.payments.listRefundsForPayment('pay1')
          expect(refunds).toContainEqual(refund)
        })
      })
    })

    describe('customers', () => {
      it('should save and find customer by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const customer = fixtures.makeCustomer({ id: 'cust1' })
          await repos.customers.save(customer)
          const found = await repos.customers.findById('cust1')
          expect(found).toEqual(customer)
        })
      })

      it('should return null for missing customer', async () => {
        await getProvider().withTransaction(async (repos) => {
          const found = await repos.customers.findById('missing')
          expect(found).toBeNull()
        })
      })

      it('should find customer by email', async () => {
        await getProvider().withTransaction(async (repos) => {
          const customer = fixtures.makeCustomer({
            id: 'cust1',
            email: 'unique@test.com',
          })
          await repos.customers.save(customer)
          const found = await repos.customers.findByEmail('unique@test.com')
          expect(found).toEqual(customer)
        })
      })

      it('should find customer by phone', async () => {
        await getProvider().withTransaction(async (repos) => {
          const customer = fixtures.makeCustomer({
            id: 'cust1',
            phone: '+9999999999',
          })
          await repos.customers.save(customer)
          const found = await repos.customers.findByPhone('+9999999999')
          expect(found).toEqual(customer)
        })
      })

      it('should search customers by name', async () => {
        await getProvider().withTransaction(async (repos) => {
          const customer = fixtures.makeCustomer({
            id: 'cust1',
            firstName: 'Jane',
            lastName: 'Smith',
          })
          await repos.customers.save(customer)
          const results = await repos.customers.searchByName('Jane')
          expect(results).toContainEqual(customer)
        })
      })

      it('should list all customers', async () => {
        await getProvider().withTransaction(async (repos) => {
          const customer = fixtures.makeCustomer({ id: 'cust1' })
          await repos.customers.save(customer)
          const all = await repos.customers.listAll()
          expect(all).toContainEqual(customer)
        })
      })
    })

    describe('purchasing', () => {
      it('should save and find supplier by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const supplier = fixtures.makeSupplier({ id: 'supp1' })
          await repos.purchasing.saveSupplier(supplier)
          const found = await repos.purchasing.findSupplierById('supp1')
          expect(found).toEqual(supplier)
        })
      })

      it('should list all suppliers', async () => {
        await getProvider().withTransaction(async (repos) => {
          const supplier = fixtures.makeSupplier({ id: 'supp1' })
          await repos.purchasing.saveSupplier(supplier)
          const all = await repos.purchasing.listSuppliers()
          expect(all).toContainEqual(supplier)
        })
      })

      it('should save and find purchase order by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const po = fixtures.makePurchaseOrder({ id: 'po1' })
          await repos.purchasing.savePurchaseOrder(po)
          const found = await repos.purchasing.findPurchaseOrderById('po1')
          expect(found).toEqual(po)
        })
      })

      it('should list open purchase orders', async () => {
        await getProvider().withTransaction(async (repos) => {
          const po = fixtures.makePurchaseOrder({ id: 'po1', status: 'submitted' })
          await repos.purchasing.savePurchaseOrder(po)
          const open = await repos.purchasing.listOpenPurchaseOrders()
          expect(open).toContainEqual(po)
        })
      })

      it('should list purchase orders by supplier', async () => {
        await getProvider().withTransaction(async (repos) => {
          const po = fixtures.makePurchaseOrder({
            id: 'po1',
            supplierId: 'supp1',
          })
          await repos.purchasing.savePurchaseOrder(po)
          const pos = await repos.purchasing.listPurchaseOrdersBySupplier('supp1')
          expect(pos).toContainEqual(po)
        })
      })

      it('should mark purchase order as received', async () => {
        await getProvider().withTransaction(async (repos) => {
          const po = fixtures.makePurchaseOrder({ id: 'po1' })
          await repos.purchasing.savePurchaseOrder(po)
          await repos.purchasing.markReceived('po1', new Date())
          const found = await repos.purchasing.findPurchaseOrderById('po1')
          expect(found).not.toBeNull()
        })
      })
    })

    describe('promotions', () => {
      it('should save and find promotion by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const promo = fixtures.makePromotion({ id: 'promo1' })
          await repos.promotions.save(promo)
          const found = await repos.promotions.findById('promo1')
          expect(found).toEqual(promo)
        })
      })

      it('should find promotion by code', async () => {
        await getProvider().withTransaction(async (repos) => {
          const promo = fixtures.makePromotion({
            id: 'promo1',
            code: 'UNIQUE-CODE',
          })
          await repos.promotions.save(promo)
          const found = await repos.promotions.findByCode('UNIQUE-CODE')
          expect(found).toEqual(promo)
        })
      })

      it('should list active promotions', async () => {
        await getProvider().withTransaction(async (repos) => {
          const promo = fixtures.makePromotion({ id: 'promo1', active: true })
          await repos.promotions.save(promo)
          const active = await repos.promotions.listActive()
          expect(active).toContainEqual(promo)
        })
      })

      it('should list all promotions', async () => {
        await getProvider().withTransaction(async (repos) => {
          const promo = fixtures.makePromotion({ id: 'promo1' })
          await repos.promotions.save(promo)
          const all = await repos.promotions.listAll()
          expect(all).toContainEqual(promo)
        })
      })

      it('should deactivate promotion', async () => {
        await getProvider().withTransaction(async (repos) => {
          const promo = fixtures.makePromotion({ id: 'promo1', active: true })
          await repos.promotions.save(promo)
          await repos.promotions.deactivate('promo1')
        })
      })
    })

    describe('organization', () => {
      it('should save and find organization by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const org = fixtures.makeOrganization({ id: 'org1' })
          await repos.organization.saveOrganization(org)
          const found = await repos.organization.findOrganizationById('org1')
          expect(found).toEqual(org)
        })
      })

      it('should find organization by slug', async () => {
        await getProvider().withTransaction(async (repos) => {
          const org = fixtures.makeOrganization({ id: 'org1', slug: 'unique-slug' })
          await repos.organization.saveOrganization(org)
          const found = await repos.organization.findOrganizationBySlug('unique-slug')
          expect(found).toEqual(org)
        })
      })

      it('should list all organizations', async () => {
        await getProvider().withTransaction(async (repos) => {
          const org = fixtures.makeOrganization({ id: 'org1' })
          await repos.organization.saveOrganization(org)
          const all = await repos.organization.listOrganizations()
          expect(all).toContainEqual(org)
        })
      })

      it('should save and find branch by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const branch = fixtures.makeBranch({ id: 'branch1', orgId: 'org1' })
          await repos.organization.saveBranch(branch)
          const found = await repos.organization.findBranchById('branch1')
          expect(found).toEqual(branch)
        })
      })

      it('should list branches for organization', async () => {
        await getProvider().withTransaction(async (repos) => {
          const branch = fixtures.makeBranch({ id: 'branch1', orgId: 'org1' })
          await repos.organization.saveBranch(branch)
          const branches = await repos.organization.listBranchesForOrg('org1')
          expect(branches).toContainEqual(branch)
        })
      })

      it('should save and find register by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const register = fixtures.makeRegister({
            id: 'reg1',
            orgId: 'org1',
            branchId: 'branch1',
          })
          await repos.organization.saveRegister(register)
          const found = await repos.organization.findRegisterById('reg1')
          expect(found).toEqual(register)
        })
      })

      it('should list registers for branch', async () => {
        await getProvider().withTransaction(async (repos) => {
          const register = fixtures.makeRegister({
            id: 'reg1',
            orgId: 'org1',
            branchId: 'branch1',
          })
          await repos.organization.saveRegister(register)
          const registers = await repos.organization.listRegistersForBranch('branch1')
          expect(registers).toContainEqual(register)
        })
      })

      it('should save and find membership by org and user', async () => {
        await getProvider().withTransaction(async (repos) => {
          const membership = fixtures.makeMembership({
            id: 'mem1',
            orgId: 'org1',
            userId: 'user1',
          })
          await repos.organization.saveMembership(membership)
          const found = await repos.organization.findMembership('org1', 'user1')
          expect(found).toEqual(membership)
        })
      })

      it('should list memberships for organization', async () => {
        await getProvider().withTransaction(async (repos) => {
          const membership = fixtures.makeMembership({
            id: 'mem1',
            orgId: 'org1',
            userId: 'user1',
          })
          await repos.organization.saveMembership(membership)
          const memberships = await repos.organization.listMembershipsForOrg('org1')
          expect(memberships).toContainEqual(membership)
        })
      })

      it('should list memberships for user', async () => {
        await getProvider().withTransaction(async (repos) => {
          const membership = fixtures.makeMembership({
            id: 'mem1',
            orgId: 'org1',
            userId: 'user1',
          })
          await repos.organization.saveMembership(membership)
          const memberships = await repos.organization.listMembershipsForUser('user1')
          expect(memberships).toContainEqual(membership)
        })
      })

      it('should save and list branch assignments for membership', async () => {
        await getProvider().withTransaction(async (repos) => {
          const assignment = fixtures.makeBranchAssignment({
            id: 'assign1',
            orgId: 'org1',
            membershipId: 'mem1',
            branchId: 'branch1',
          })
          await repos.organization.saveBranchAssignment(assignment)
          const assignments = await repos.organization.listAssignmentsForMembership('mem1')
          expect(assignments).toContainEqual(assignment)
        })
      })

      it('should list branch assignments for branch', async () => {
        await getProvider().withTransaction(async (repos) => {
          const assignment = fixtures.makeBranchAssignment({
            id: 'assign1',
            orgId: 'org1',
            membershipId: 'mem1',
            branchId: 'branch1',
          })
          await repos.organization.saveBranchAssignment(assignment)
          const assignments = await repos.organization.listAssignmentsForBranch('branch1')
          expect(assignments).toContainEqual(assignment)
        })
      })

      it('should delete branch assignment', async () => {
        await getProvider().withTransaction(async (repos) => {
          const assignment = fixtures.makeBranchAssignment({
            id: 'assign1',
            orgId: 'org1',
            membershipId: 'mem1',
            branchId: 'branch1',
          })
          await repos.organization.saveBranchAssignment(assignment)
          await repos.organization.deleteBranchAssignment('assign1')
          const found = (await repos.organization.listAssignmentsForBranch('branch1')).find((a) => a.id === 'assign1')
          expect(found).toBeUndefined()
        })
      })

      it('should save and find invite by token', async () => {
        await getProvider().withTransaction(async (repos) => {
          const invite = fixtures.makeInvite({
            id: 'inv1',
            orgId: 'org1',
            token: 'unique-token-123',
          })
          await repos.organization.saveInvite(invite)
          const found = await repos.organization.findInviteByToken('unique-token-123')
          expect(found).toEqual(invite)
        })
      })

      it('should list invites for organization', async () => {
        await getProvider().withTransaction(async (repos) => {
          const invite = fixtures.makeInvite({
            id: 'inv1',
            orgId: 'org1',
          })
          await repos.organization.saveInvite(invite)
          const invites = await repos.organization.listInvitesForOrg('org1')
          expect(invites).toContainEqual(invite)
        })
      })
    })

    describe('auth', () => {
      it('should save and find user by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const user = fixtures.makeUser({ id: 'user1' })
          await repos.auth.saveUser(user)
          const found = await repos.auth.findUserById('user1')
          expect(found).toEqual(user)
        })
      })

      it('should return null for missing user', async () => {
        await getProvider().withTransaction(async (repos) => {
          const found = await repos.auth.findUserById('missing')
          expect(found).toBeNull()
        })
      })

      it('should find user by username', async () => {
        await getProvider().withTransaction(async (repos) => {
          const user = fixtures.makeUser({
            id: 'user1',
            username: 'unique-user',
          })
          await repos.auth.saveUser(user)
          const found = await repos.auth.findUserByUsername('unique-user')
          expect(found).toEqual(user)
        })
      })

      it('should list all users', async () => {
        await getProvider().withTransaction(async (repos) => {
          const user = fixtures.makeUser({ id: 'user1' })
          await repos.auth.saveUser(user)
          const all = await repos.auth.listUsers()
          expect(all).toContainEqual(user)
        })
      })

      it('should save and find session by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const session = fixtures.makeSession({
            id: 'sess1',
            userId: 'user1',
          })
          await repos.auth.saveSession(session)
          const found = await repos.auth.findSessionById('sess1')
          expect(found).toEqual(session)
        })
      })

      it('should revoke session', async () => {
        await getProvider().withTransaction(async (repos) => {
          const session = fixtures.makeSession({
            id: 'sess1',
            userId: 'user1',
          })
          await repos.auth.saveSession(session)
          await repos.auth.revokeSession('sess1', new Date())
        })
      })

      it('should list active sessions for user', async () => {
        await getProvider().withTransaction(async (repos) => {
          const session = fixtures.makeSession({
            id: 'sess1',
            userId: 'user1',
          })
          await repos.auth.saveSession(session)
          const sessions = await repos.auth.listActiveSessionsForUser('user1', new Date('2024-01-01'))
          expect(sessions).toContainEqual(session)
        })
      })
    })

    describe('audit', () => {
      it('should append and find audit entry by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const entry = fixtures.makeAuditEntry({ id: 'audit1' })
          await repos.audit.append(entry)
          const found = await repos.audit.findById('audit1')
          expect(found).toEqual(entry)
        })
      })

      it('should return null for missing audit entry', async () => {
        await getProvider().withTransaction(async (repos) => {
          const found = await repos.audit.findById('missing')
          expect(found).toBeNull()
        })
      })

      it('should list audit entries by entity', async () => {
        await getProvider().withTransaction(async (repos) => {
          const entry = fixtures.makeAuditEntry({
            id: 'audit1',
            entityType: 'Product',
            entityId: 'p1',
          })
          await repos.audit.append(entry)
          const entries = await repos.audit.listByEntity('Product', 'p1')
          expect(entries).toContainEqual(entry)
        })
      })

      it('should list audit entries by actor', async () => {
        await getProvider().withTransaction(async (repos) => {
          const entry = fixtures.makeAuditEntry({
            id: 'audit1',
            actorId: 'user1',
          })
          await repos.audit.append(entry)
          const entries = await repos.audit.listByActor('user1')
          expect(entries).toContainEqual(entry)
        })
      })

      it('should list audit entries by date range', async () => {
        await getProvider().withTransaction(async (repos) => {
          const entry = fixtures.makeAuditEntry({ id: 'audit1' })
          await repos.audit.append(entry)
          const from = new Date('2024-01-01')
          const to = new Date('2024-12-31')
          const entries = await repos.audit.listByDateRange(from, to)
          expect(entries).toContainEqual(entry)
        })
      })
    })
  })
}

    describe('system-enums', () => {
      it('should save and find system enum value by id', async () => {
        await getProvider().withTransaction(async (repos) => {
          const value = fixtures.makeSystemEnumValue({ id: 'enum1' })
          await repos.systemEnums.save(value)
          const found = await repos.systemEnums.findById('enum1')
          expect(found).toEqual(value)
        })
      })

      it('should return null for missing system enum value', async () => {
        await getProvider().withTransaction(async (repos) => {
          const found = await repos.systemEnums.findById('missing')
          expect(found).toBeNull()
        })
      })

      it('should list system enum values for org', async () => {
        await getProvider().withTransaction(async (repos) => {
          const value = fixtures.makeSystemEnumValue({ id: 'enum1', orgId: 'org1' })
          await repos.systemEnums.save(value)
          const values = await repos.systemEnums.listForOrg('org1')
          expect(values).toContainEqual(value)
        })
      })

      it('should list system enum values for org and key', async () => {
        await getProvider().withTransaction(async (repos) => {
          const value1 = fixtures.makeSystemEnumValue({
            id: 'enum1',
            orgId: 'org1',
            registryKey: 'paymentMethod',
          })
          const value2 = fixtures.makeSystemEnumValue({
            id: 'enum2',
            orgId: 'org1',
            registryKey: 'discountType',
          })
          await repos.systemEnums.save(value1)
          await repos.systemEnums.save(value2)
          const values = await repos.systemEnums.listForOrgAndKey('org1', 'paymentMethod')
          expect(values).toContainEqual(value1)
          expect(values).not.toContainEqual(value2)
        })
      })

      it('should delete system enum value', async () => {
        await getProvider().withTransaction(async (repos) => {
          const value = fixtures.makeSystemEnumValue({ id: 'enum1', orgId: 'org1' })
          await repos.systemEnums.save(value)
          await repos.systemEnums.delete('enum1')
          const found = await repos.systemEnums.findById('enum1')
          expect(found).toBeNull()
        })
      })
    })
