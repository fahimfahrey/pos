# Graph Report - .  (2026-07-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1317 nodes · 3259 edges · 105 communities (67 shown, 38 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `065e850c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CatalogRepository
- CoreOrganizationRepository
- fixtures.ts
- settings.ts
- dependencies
- compilerOptions
- auth-service.ts
- SalesRepository
- index.ts
- CorePurchasingRepository
- DriverTransaction
- index.ts
- pin-reauth.ts
- SystemEnumValue
- verifyToken
- enum-values-table.tsx
- Clock
- Payment
- driver.ts
- createDefaultStorageProvider
- index.ts
- catalog.schema.ts
- Promotion
- CollectionName
- FileStore
- StorageDriver
- SessionStore
- build-repository-set.ts
- Customer
- InventoryRepository
- AuditEntry
- IndexedDBDriver
- session.ts
- onboarding.ts
- discount-policy.ts
- complete-sale.ts
- inventory-service.ts
- StockLevel
- container.ts
- repository.ts
- CoreInventoryRepository
- index.ts
- createStorageProvider
- StockMovement
- StocktakeSession
- RateLimiter
- finalize-sale-service.ts
- Hasher
- barcode-encoder.ts
- inventory.schema.ts
- .prettierrc.json
- layout.tsx
- shift-service.ts
- devDependencies
- ENUM_REGISTRY_KEY
- store.ts
- layout.tsx
- ulid.ts
- eslint
- eslint.config.mjs
- eslint-config-next
- eslint-config-prettier
- @eslint/eslintrc
- eslint-import-resolver-typescript
- eslint-plugin-boundaries
- fake-indexeddb
- jsdom
- next.config.ts
- @playwright/test
- postcss
- prettier
- tailwindcss
- @tailwindcss/postcss
- @testing-library/user-event
- @types/bcryptjs
- @types/node
- @types/react
- @types/react-dom
- typescript
- vite-tsconfig-paths
- @vitejs/plugin-react
- vitest
- @vitest/browser
- postcss.config.mjs
- sw.js
- money.ts
- boundaries.test.ts
- schema.ts

## God Nodes (most connected - your core abstractions)
1. `DriverTransaction` - 42 edges
2. `InventoryRepository` - 41 edges
3. `CatalogRepository` - 36 edges
4. `SalesRepository` - 35 edges
5. `Collection` - 34 edges
6. `CoreCatalogRepository` - 32 edges
7. `CoreOrganizationRepository` - 32 edges
8. `CollectionName` - 30 edges
9. `CoreSalesRepository` - 29 edges
10. `OrganizationRepository` - 28 edges

## Surprising Connections (you probably didn't know these)
- `buildVersionChain()` --references--> `dexie`  [EXTRACTED]
  src/infrastructure/storage/adapters/indexeddb/schema.ts → package.json
- `LoginPage()` --indirect_call--> `logInAction()`  [INFERRED]
  src/app/(auth)/login/page.tsx → src/domains/auth/actions/log-in.ts
- `SignupPage()` --indirect_call--> `signUpAction()`  [INFERRED]
  src/app/(auth)/signup/page.tsx → src/domains/auth/actions/sign-up.ts
- `listProducts()` --calls--> `toErrorResponse()`  [EXTRACTED]
  src/domains/inventory/actions/list-products.ts → src/shared/errors/to-error-response.ts
- `runConcurrencySuite()` --indirect_call--> `InsufficientStockError`  [INFERRED]
  src/infrastructure/storage/conformance/suites/concurrency.ts → src/domains/inventory/errors.ts

## Import Cycles
- None detected.

## Communities (105 total, 38 thin omitted)

### Community 0 - "CatalogRepository"
Cohesion: 0.06
Nodes (13): Category, PriceList, PriceListEntry, Product, ProductVariant, CatalogEvent, CatalogRepository, CatalogQueryService (+5 more)

### Community 1 - "CoreOrganizationRepository"
Cohesion: 0.06
Nodes (17): INVITE_STATUS, InviteStatus, MembershipRole, MEMBERSHIP_STATUS, MembershipStatus, AcceptInviteInput, CreateInviteInput, revokeInvite() (+9 more)

### Community 2 - "fixtures.ts"
Cohesion: 0.09
Nodes (45): CatalogItem, Category, defaultConformanceAdapters, FIXED_DATE, FixtureOverrides, makeAuditEntry(), makeBranch(), makeBranchAssignment() (+37 more)

### Community 3 - "settings.ts"
Cohesion: 0.09
Nodes (36): TAX_MODE, TaxMode, BusinessHours, DayHours, DEFAULT_SETTINGS, InventorySettings, LoyaltyRules, OrganizationSettings (+28 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (44): bcryptjs, clsx, dexie, idb, jose, next, dependencies, bcryptjs (+36 more)

### Community 5 - "compilerOptions"
Cohesion: 0.04
Nodes (44): **/__boundary_fixtures__/**, dom, dom.iterable, e2e, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts (+36 more)

### Community 6 - "auth-service.ts"
Cohesion: 0.10
Nodes (11): LoginInput, PinReauthInput, SetPinInput, SetPinInputSchema, SignupInput, Session, User, AuthService (+3 more)

### Community 7 - "SalesRepository"
Cohesion: 0.10
Nodes (7): ReceiptCounter, SaleItem, Sale, Shift, SalesRepository, ShiftService, CoreSalesRepository

### Community 8 - "index.ts"
Cohesion: 0.10
Nodes (15): listProducts(), InsufficientStockError, createOrder(), createOrderSchema, container, ImportFormatError, MigrationError, StorageError (+7 more)

### Community 9 - "CorePurchasingRepository"
Cohesion: 0.15
Nodes (6): PurchaseOrder, PurchaseOrderLine, PurchaseOrderStatus, Supplier, PurchasingRepository, CorePurchasingRepository

### Community 10 - "DriverTransaction"
Cohesion: 0.10
Nodes (4): Collection, DriverTransaction, InternalMigrationContext, MigrationContext

### Community 11 - "index.ts"
Cohesion: 0.14
Nodes (15): BARCODE_SYMBOLOGY, BarcodeSymbology, MEMBERSHIP_ROLE, ORGANIZATION_PLAN, OrganizationPlan, ORGANIZATION_STATUS, OrganizationStatus, PAYMENT_METHOD (+7 more)

### Community 12 - "pin-reauth.ts"
Cohesion: 0.19
Nodes (15): LoginPage(), SignupPage(), logInAction(), logOutAction(), pinReauthAction(), signUpAction(), LoginInputSchema, PinReauthInputSchema (+7 more)

### Community 13 - "SystemEnumValue"
Cohesion: 0.20
Nodes (5): EnumRegistryKey, SystemEnumValue, SystemEnumValueRepository, EnumRegistryService, CoreSystemEnumValueRepository

### Community 14 - "verifyToken"
Cohesion: 0.16
Nodes (12): offlineCheckSession(), offlineGetSession(), sessionStore, SessionClaims, SessionInput, getSecret(), signToken(), verifyToken() (+4 more)

### Community 15 - "enum-values-table.tsx"
Cohesion: 0.15
Nodes (15): EDITABLE_KEYS, REGISTRY_LABELS, EnumValuesTable(), LABEL_MAPS, REGISTRY_LABELS, STOCK_MOVEMENT_TYPE, StockMovementType, UNIT_OF_MEASURE (+7 more)

### Community 16 - "Clock"
Cohesion: 0.16
Nodes (6): ORDER_STATUS, OrderStatus, ORDER_STATUS_LABELS, SalesService, Clock, IdGenerator

### Community 17 - "Payment"
Cohesion: 0.17
Nodes (5): Payment, PaymentStatus, Refund, PaymentsRepository, CorePaymentsRepository

### Community 18 - "driver.ts"
Cohesion: 0.19
Nodes (10): exportBackupToFile(), importBackupFromFile(), exportAll(), importAll(), ImportMode, SerializationCodec, StorageExport, COLLECTIONS (+2 more)

### Community 19 - "createDefaultStorageProvider"
Cohesion: 0.27
Nodes (18): CreateEnumValueForm(), EnumValuesPage(), getCurrentSession(), assertActive(), hasAtLeast(), requireAdminMembership(), requireOwnerMembership(), requireRole() (+10 more)

### Community 20 - "index.ts"
Cohesion: 0.20
Nodes (8): ephemeralDatabaseName(), resolveDatabaseName(), StorageCloneError, StorageQuotaError, StorageUnavailableError, StorageUpgradeBlockedError, DriverFactory, runStorageConformance()

### Community 21 - "catalog.schema.ts"
Cohesion: 0.15
Nodes (17): Category, categorySchema, CsvRow, csvRowSchema, PriceList, PriceListEntry, priceListEntrySchema, priceListSchema (+9 more)

### Community 22 - "Promotion"
Cohesion: 0.19
Nodes (4): Promotion, PromotionKind, PromotionsRepository, CorePromotionsRepository

### Community 23 - "CollectionName"
Cohesion: 0.19
Nodes (6): InMemoryTransaction, MemoryStorageDriver, CollectionName, SchemaDescriptor, TxMode, EntityEnvelope

### Community 24 - "FileStore"
Cohesion: 0.21
Nodes (4): IndexedDBFileStore, MemoryFileStore, FileStore, StoredFile

### Community 25 - "StorageDriver"
Cohesion: 0.14
Nodes (4): StorageDriver, SchemaStep, SchemaVersioner, InternalStorageProvider

### Community 26 - "SessionStore"
Cohesion: 0.16
Nodes (5): AUTH_ERROR, getCookieOptions(), CookieSessionStore, LocalSessionStore, SessionStore

### Community 27 - "build-repository-set.ts"
Cohesion: 0.18
Nodes (7): AuthRepository, buildRepositorySet(), RepositoryContext, RepositorySet, InternalUnitOfWork, UnitOfWork, withTransaction()

### Community 28 - "Customer"
Cohesion: 0.23
Nodes (3): Customer, CustomersRepository, CoreCustomersRepository

### Community 29 - "InventoryRepository"
Cohesion: 0.24
Nodes (4): InventoryRepository, InventoryService, DriftReport, ReconciliationService

### Community 30 - "AuditEntry"
Cohesion: 0.24
Nodes (3): AuditEntry, AuditRepository, CoreAuditRepository

### Community 31 - "IndexedDBDriver"
Cohesion: 0.26
Nodes (4): IndexedDBDriver, IndexedDBTransaction, mapIndexedDbError(), err()

### Community 32 - "session.ts"
Cohesion: 0.19
Nodes (11): AdminLayout(), DashboardLayout(), getCurrentUser(), requireSession(), requireUser(), clientSchema, env, parsedClient (+3 more)

### Community 33 - "onboarding.ts"
Cohesion: 0.17
Nodes (11): OnboardingWizard(), Step, metadata, acceptInvite(), createInvite(), completeOnboarding(), createBranch(), createOrganization() (+3 more)

### Community 34 - "discount-policy.ts"
Cohesion: 0.24
Nodes (8): DISCOUNT_TYPE, DiscountType, DiscountLimits, DiscountPolicyInput, DiscountPolicyService, ManagerOverrideToken, FinalizeSaleService, ForbiddenError

### Community 35 - "complete-sale.ts"
Cohesion: 0.28
Nodes (7): baseInputSchema, CompleteSaleInput, CompleteSaleResult, completeSaleWithProvider(), SystemClock, UuidIdGenerator, catalogEventBus

### Community 38 - "container.ts"
Cohesion: 0.14
Nodes (7): clock, ids, inventoryRepository, salesRepository, db, PosDatabase, DexieSalesRepository

### Community 39 - "repository.ts"
Cohesion: 0.23
Nodes (3): ParkedCart, ParkedCartLine, CartDiscount

### Community 41 - "index.ts"
Cohesion: 0.29
Nodes (7): assert(), invariant(), cn(), isErr(), isOk(), ok(), Result

### Community 42 - "createStorageProvider"
Cohesion: 0.28
Nodes (5): getRegisteredEngines(), registerEngine(), registry, resolveEngine(), createStorageProvider()

### Community 45 - "RateLimiter"
Cohesion: 0.33
Nodes (4): InMemoryRateLimiter, RateLimitEntry, RateLimiter, RateLimitResult

### Community 46 - "finalize-sale-service.ts"
Cohesion: 0.36
Nodes (5): SALE_STATUS, SaleStatus, formatReceiptNumber(), parseReceiptNumber(), FinalizeSaleResult

### Community 48 - "barcode-encoder.ts"
Cohesion: 0.57
Nodes (5): calculateEan13Checksum(), CODE128_PATTERNS, encodeCode128(), encodeEan13(), validateEan13Checksum()

### Community 49 - "inventory.schema.ts"
Cohesion: 0.29
Nodes (6): AdjustStockInput, adjustStockInputSchema, RecordCountInput, recordCountInputSchema, TransferStockInput, transferStockInputSchema

### Community 50 - ".prettierrc.json"
Cohesion: 0.33
Nodes (5): arrowParens, printWidth, semi, singleQuote, trailingComma

### Community 51 - "layout.tsx"
Cohesion: 0.40
Nodes (3): ServiceWorkerRegister(), metadata, viewport

### Community 53 - "devDependencies"
Cohesion: 0.60
Nodes (5): devDependencies, @testing-library/dom, @testing-library/jest-dom, @testing-library/react, @testing-library/dom

### Community 54 - "ENUM_REGISTRY_KEY"
Cohesion: 0.40
Nodes (4): ENUM_REGISTRY_KEY, registryKeys, SystemEnumValueInput, systemEnumValueInputSchema

### Community 55 - "store.ts"
Cohesion: 0.50
Nodes (3): OrganizationSetting, Register, Store

### Community 104 - "schema.ts"
Cohesion: 0.40
Nodes (3): buildVersionChain(), COLLECTION_INDEXES, V1_STORES_SPEC

## Knowledge Gaps
- **177 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `arrowParens` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildVersionChain()` connect `schema.ts` to `index.ts`, `dependencies`, `IndexedDBDriver`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `dexie` connect `dependencies` to `schema.ts`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CatalogRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.05553923009109609 - nodes in this community are weakly interconnected._
- **Should `CoreOrganizationRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.062111801242236024 - nodes in this community are weakly interconnected._
- **Should `fixtures.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09192546583850932 - nodes in this community are weakly interconnected._
- **Should `settings.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._