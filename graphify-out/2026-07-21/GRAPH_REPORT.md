# Graph Report - pos  (2026-07-19)

## Corpus Check
- 358 files · ~134,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2194 nodes · 4672 edges · 138 communities (94 shown, 44 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e8684cb0`
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
- Implementation Steps
- Files To Create or Modify
- Authentication Guide
- Hardware Support
- Files To Create or Modify
- Completed Components
- Files To Create or Modify
- Files To Create or Modify
- Files To Create or Modify
- Completed
- ✅ Completed (Foundation Layer)
- Runtime-Extensible System Enums — Implementation Plan
- Payment System Architecture
- Implementation Plan — `domains/auth` (TAHFIUM auth: credentials, JWT sessions, guard, PIN re-auth, rate limiting)
- Plan: domains/inventory — StockMovement ledger, StockLevel, reconciliation, adjustment/transfer/low-stock/stocktake UI
- Storage Adapter Authoring Guide
- receipt-print-orchestrator.test.ts
- Plan — Storage conformance suite: one reusable spec every adapter must pass, auto-expanded per adapter in CI
- EscPosPrinter
- printer-registry.ts
- escpos-encoder.ts
- IndexedDB Storage Adapter
- StocktakeCount
- page.tsx
- GatewayEventStore
- README.md
- RefundStatus
- STOCK_MOVEMENT_TYPE
- USBDevice
- AGENTS.md
- @testing-library/jest-dom
- @testing-library/react

## God Nodes (most connected - your core abstractions)
1. `InventoryRepository` - 45 edges
2. `DriverTransaction` - 42 edges
3. `SalesRepository` - 40 edges
4. `CatalogRepository` - 36 edges
5. `IdGenerator` - 35 edges
6. `Collection` - 34 edges
7. `AppError` - 34 edges
8. `CoreCatalogRepository` - 32 edges
9. `CoreOrganizationRepository` - 32 edges
10. `CollectionName` - 30 edges

## Surprising Connections (you probably didn't know these)
- `buildVersionChain()` --references--> `dexie`  [EXTRACTED]
  src/infrastructure/storage/adapters/indexeddb/schema.ts → package.json
- `LoginPage()` --indirect_call--> `logInAction()`  [INFERRED]
  src/app/(auth)/login/page.tsx → src/domains/auth/actions/log-in.ts
- `SignupPage()` --indirect_call--> `signUpAction()`  [INFERRED]
  src/app/(auth)/signup/page.tsx → src/domains/auth/actions/sign-up.ts
- `revokeInvite()` --calls--> `createDefaultStorageProvider()`  [EXTRACTED]
  src/domains/organization/actions/invite.ts → src/infrastructure/storage/default-provider.ts
- `FinalizeSaleResult` --references--> `Sale`  [EXTRACTED]
  src/domains/sales/services/finalize-sale-service.ts → src/domains/sales/entities/sale.ts

## Import Cycles
- None detected.

## Communities (138 total, 44 thin omitted)

### Community 0 - "CatalogRepository"
Cohesion: 0.06
Nodes (12): Category, PriceList, PriceListEntry, Product, ProductVariant, CatalogEvent, CatalogRepository, CatalogQueryService (+4 more)

### Community 1 - "CoreOrganizationRepository"
Cohesion: 0.05
Nodes (27): BarcodeSymbology, MembershipRole, MembershipStatus, TaxMode, CreateInviteInput, BranchAssignment, Branch, Invite (+19 more)

### Community 2 - "fixtures.ts"
Cohesion: 0.08
Nodes (48): CatalogItem, Category, InsufficientStockError, defaultConformanceAdapters, FIXED_DATE, FixtureOverrides, makeAuditEntry(), makeBranch() (+40 more)

### Community 3 - "settings.ts"
Cohesion: 0.18
Nodes (20): TAX_MODE, applyLineDiscount(), applyRounding(), calculateChangeDue(), CartLine, CartTotal, DiscountSpec, fromMinorUnits() (+12 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (44): bcryptjs, clsx, dexie, idb, jose, next, dependencies, bcryptjs (+36 more)

### Community 5 - "compilerOptions"
Cohesion: 0.04
Nodes (44): **/__boundary_fixtures__/**, dom, dom.iterable, e2e, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts (+36 more)

### Community 6 - "auth-service.ts"
Cohesion: 0.12
Nodes (7): SignupInput, Session, User, AuthRepository, pinReauthTtlSeconds(), sessionTtlSeconds(), CoreAuthRepository

### Community 7 - "SalesRepository"
Cohesion: 0.07
Nodes (9): PurchaseHistoryService, ParkedCart, ReceiptCounter, SaleItem, Sale, Shift, SalesRepository, ShiftService (+1 more)

### Community 8 - "index.ts"
Cohesion: 0.07
Nodes (27): PAYMENT_STATUS, REFUND_STATUS, GatewayNotRegisteredError, InvalidPaymentStatusTransitionError, RefundExceedsPaymentError, PaymentEvent, ChargeRequest, ChargeResult (+19 more)

### Community 9 - "CorePurchasingRepository"
Cohesion: 0.05
Nodes (24): InsufficientLoyaltyPointsError, InsufficientStoreCreditError, LoyaltyNotEnabledError, SplitPaymentTotalMismatchError, InvalidCouponCodeError, PromotionExpiredError, PromotionNotFoundError, PromotionUsageLimitExceededError (+16 more)

### Community 11 - "index.ts"
Cohesion: 0.15
Nodes (13): BARCODE_SYMBOLOGY, INVITE_STATUS, InviteStatus, ORGANIZATION_PLAN, OrganizationPlan, ORGANIZATION_STATUS, OrganizationStatus, STOCKTAKE_STATUS (+5 more)

### Community 12 - "pin-reauth.ts"
Cohesion: 0.12
Nodes (26): LoginPage(), SignupPage(), logInAction(), logOutAction(), pinReauthAction(), signUpAction(), LoginInput, LoginInputSchema (+18 more)

### Community 13 - "SystemEnumValue"
Cohesion: 0.18
Nodes (6): EnumRegistryKey, SystemEnumValue, SystemEnumValueRepository, EnumRegistryService, CoreSystemEnumValueRepository, ConflictError

### Community 14 - "verifyToken"
Cohesion: 0.13
Nodes (15): AdminLayout(), DashboardLayout(), requireSession(), offlineCheckSession(), offlineGetSession(), sessionStore, SessionClaims, SessionInput (+7 more)

### Community 15 - "enum-values-table.tsx"
Cohesion: 0.18
Nodes (14): EDITABLE_KEYS, REGISTRY_LABELS, EnumValuesTable(), LABEL_MAPS, REGISTRY_LABELS, ENUM_REGISTRY_KEY, DISCOUNT_TYPE_LABELS, MEMBERSHIP_ROLE_LABELS (+6 more)

### Community 16 - "Clock"
Cohesion: 0.13
Nodes (8): RefundedItem, PaymentService, RefundInput, RefundService, SalesService, resolvePaymentGateway(), Clock, IdGenerator

### Community 17 - "Payment"
Cohesion: 0.11
Nodes (9): PaymentStatus, Payment, Refund, PaymentStatusEvent, assertSplitPaymentsCoverTotal(), sumPaymentAmounts(), PaymentsRepository, isValidPaymentStatusTransition() (+1 more)

### Community 18 - "driver.ts"
Cohesion: 0.20
Nodes (10): exportBackupToFile(), importBackupFromFile(), exportAll(), importAll(), ImportMode, SerializationCodec, StorageExport, COLLECTIONS (+2 more)

### Community 19 - "createDefaultStorageProvider"
Cohesion: 0.11
Nodes (26): CreateEnumValueForm(), EnumValuesPage(), getCurrentSession(), assertActive(), hasAtLeast(), requireAdminMembership(), requireOwnerMembership(), requireRole() (+18 more)

### Community 20 - "index.ts"
Cohesion: 0.12
Nodes (13): ephemeralDatabaseName(), resolveDatabaseName(), StorageCloneError, StorageQuotaError, StorageUnavailableError, StorageUpgradeBlockedError, buildVersionChain(), COLLECTION_INDEXES (+5 more)

### Community 21 - "catalog.schema.ts"
Cohesion: 0.15
Nodes (17): Category, categorySchema, CsvRow, csvRowSchema, PriceList, PriceListEntry, priceListEntrySchema, priceListSchema (+9 more)

### Community 22 - "Promotion"
Cohesion: 0.08
Nodes (21): DiscountType, Promotion, PromotionComboLine, PromotionKind, PromotionTimeWindow, PromotionRedemption, AppliedPromotion, computeDiscount() (+13 more)

### Community 23 - "CollectionName"
Cohesion: 0.13
Nodes (8): InMemoryTransaction, MemoryStorageDriver, CollectionName, SchemaDescriptor, TxMode, EntityEnvelope, InternalMigrationContext, MigrationContext

### Community 24 - "FileStore"
Cohesion: 0.21
Nodes (4): IndexedDBFileStore, MemoryFileStore, FileStore, StoredFile

### Community 25 - "StorageDriver"
Cohesion: 0.09
Nodes (9): StorageDriver, buildRepositorySet(), RepositorySet, SchemaStep, SchemaVersioner, InternalStorageProvider, InternalUnitOfWork, UnitOfWork (+1 more)

### Community 26 - "SessionStore"
Cohesion: 0.16
Nodes (5): AUTH_ERROR, getCookieOptions(), CookieSessionStore, LocalSessionStore, SessionStore

### Community 27 - "build-repository-set.ts"
Cohesion: 0.05
Nodes (39): 10. Infrastructure (storage-engine layer), 11. Boundary fixture (intentional violation), 12. ESLint flat config with boundaries, 13. Prettier, 14. PWA plumbing, 15. Routes, layout, middleware, 16. Vitest + Testing Library, 17. Boundary acceptance test (the key deliverable) (+31 more)

### Community 28 - "Customer"
Cohesion: 0.10
Nodes (9): Customer, LoyaltyTransaction, LoyaltyTransactionType, StoreCreditTransaction, StoreCreditTransactionType, CustomersRepository, LoyaltyService, StoreCreditService (+1 more)

### Community 29 - "InventoryRepository"
Cohesion: 0.18
Nodes (4): InventoryRepository, InventoryService, DriftReport, ReconciliationService

### Community 30 - "AuditEntry"
Cohesion: 0.20
Nodes (4): AuditEntry, AuditRepository, CoreAuditRepository, RepositoryContext

### Community 31 - "IndexedDBDriver"
Cohesion: 0.26
Nodes (4): IndexedDBDriver, IndexedDBTransaction, mapIndexedDbError(), err()

### Community 32 - "session.ts"
Cohesion: 0.14
Nodes (9): DisplayCartView(), DisplayCartViewProps, DisplayPage(), useCartBroadcast(), CartSnapshot, CartSnapshotLine, BrowserBroadcastChannel, logger (+1 more)

### Community 33 - "onboarding.ts"
Cohesion: 0.10
Nodes (22): OnboardingWizard(), Step, metadata, MEMBERSHIP_STATUS, getCurrentUser(), requireUser(), acceptInvite(), AcceptInviteInput (+14 more)

### Community 34 - "discount-policy.ts"
Cohesion: 0.17
Nodes (12): DISCOUNT_TYPE, DiscountType, ORDER_STATUS, OrderStatus, DiscountLimits, ParkedCartLine, CartDiscount, SaleStatus (+4 more)

### Community 35 - "complete-sale.ts"
Cohesion: 0.06
Nodes (35): Acceptance Checklist, Accessibility Considerations, Architecture Decisions, Create — constants (`src/constants/enums/` + `maps/`), Create — domain actions (`src/domains/organization/actions/`), Create — domain entities (`src/domains/organization/entities/`), Create — domain service (`src/domains/organization/services/`), Create — onboarding UI (`src/app/(onboarding)/`) (+27 more)

### Community 38 - "container.ts"
Cohesion: 0.16
Nodes (6): clock, ids, inventoryRepository, salesRepository, db, DexieSalesRepository

### Community 39 - "repository.ts"
Cohesion: 0.06
Nodes (34): 10. `env.ts`, 11. Conformance suite (`tests/storage/conformance-suite.ts`), 12. `docs/storage-adapters.md`, 13. Typecheck & lint, 14. Verify (apply `verify` skill), 1. Relocate the two existing interfaces, 2. `eslint.config.mjs` — boundary element pattern, 3. Shared `Money` (+26 more)

### Community 41 - "index.ts"
Cohesion: 0.29
Nodes (7): assert(), invariant(), cn(), isErr(), isOk(), ok(), Result

### Community 42 - "createStorageProvider"
Cohesion: 0.29
Nodes (5): DriverFactory, getRegisteredEngines(), registerEngine(), registry, runStorageConformance()

### Community 44 - "StocktakeSession"
Cohesion: 0.13
Nodes (14): ReceiptView(), ReceiptDocument, ReceiptLineItem, ReceiptPaymentLine, ReceiptTaxBreakdownLine, BrowserPrintPrinter, escapeHtml(), renderReceiptHtml() (+6 more)

### Community 45 - "RateLimiter"
Cohesion: 0.33
Nodes (4): InMemoryRateLimiter, RateLimitEntry, RateLimiter, RateLimitResult

### Community 46 - "finalize-sale-service.ts"
Cohesion: 0.23
Nodes (7): PaymentMethod, SALE_STATUS, formatReceiptNumber(), parseReceiptNumber(), FinalizeSaleResult, FinalizeSaleService, ValidationError

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

### Community 52 - "shift-service.ts"
Cohesion: 0.29
Nodes (5): MEMBERSHIP_ROLE, PAYMENT_METHOD, STATIC_ENUM_VALUES, SHIFT_STATUS, ShiftStatus

### Community 54 - "ENUM_REGISTRY_KEY"
Cohesion: 0.50
Nodes (3): registryKeys, SystemEnumValueInput, systemEnumValueInputSchema

### Community 55 - "store.ts"
Cohesion: 0.50
Nodes (3): OrganizationSetting, Register, Store

### Community 58 - "eslint"
Cohesion: 0.29
Nodes (7): eslint, eslint-import-resolver-typescript, devDependencies, eslint, eslint-import-resolver-typescript, @testing-library/user-event, @testing-library/user-event

### Community 63 - "eslint-import-resolver-typescript"
Cohesion: 0.07
Nodes (29): Acceptance Checklist, Accessibility Considerations, Architecture Decisions, Catalog (minimal additive field for tax resolution), Conformance, Conformance suite updates, Constants / enums, e2e (`e2e/pos-scan-to-receipt.spec.ts`, Playwright) (+21 more)

### Community 73 - "@testing-library/user-event"
Cohesion: 0.09
Nodes (11): Navigator, SerialOptions, SerialPort, USBAlternateInterface, USBConfiguration, USBEndpoint, USBInterface, USBOutTransferResult (+3 more)

### Community 104 - "schema.ts"
Cohesion: 0.08
Nodes (25): Atomicity, Common Issues, Date Serialization, Disaster Recovery, Export (Backup), File Format, "File not recognized", Import Modes (+17 more)

### Community 105 - "Implementation Steps"
Cohesion: 0.08
Nodes (25): Acceptance Checklist, Accessibility Considerations, Architecture Decisions, Create — adapter (`src/infrastructure/storage/adapters/indexeddb/`), Create — default binding + browser conformance harness, Explicitly NOT changed (out of scope), Files To Create or Modify, Implementation Plan — IndexedDB Storage Adapter (Dexie) (+17 more)

### Community 106 - "Files To Create or Modify"
Cohesion: 0.08
Nodes (24): Acceptance Checklist, Accessibility Considerations, Actions (thin `'use server'` wrappers, one per capability, following `save-product.ts`/`complete-sale.ts`), Architecture Decisions, Commands to run before calling this done (implementation phase, not this plan), Conformance suite, Conformance suite (runs against both memory and IndexedDB adapters automatically), Entities (+16 more)

### Community 107 - "Authentication Guide"
Cohesion: 0.09
Nodes (22): Architecture Notes, Authentication Guide, Checking Session in Server Components, Credential Storage, Debugging, E2E Tests, Error Handling, Local/Offline Variant (+14 more)

### Community 108 - "Hardware Support"
Cohesion: 0.09
Nodes (22): Browser Print, Browser Print Dialog, Browser-Print (No Hardware Required), Compliance & Audit, Connection Methods, ESC/POS Direct, ESC/POS Encoder (No Hardware Required), Fallback Behavior (+14 more)

### Community 109 - "Files To Create or Modify"
Cohesion: 0.09
Nodes (22): Acceptance Checklist, Accessibility Considerations, App layer — customer display route, App layer — receipt view/print trigger (minimal, since checkout UI doesn't exist yet), Architecture Decisions, Customer display — BroadcastChannel port + adapter, Docs, Domain layer — organization additions (additive fields) (+14 more)

### Community 110 - "Completed Components"
Cohesion: 0.09
Nodes (22): Authorization ✅, Catalog Domain Implementation Status, Completed Components, CoreCatalogRepository ✅, Domain Entities ✅, Events ✅, Files Modified/Created Summary, FileStore ✅ (+14 more)

### Community 111 - "Files To Create or Modify"
Cohesion: 0.09
Nodes (21): Acceptance Checklist, Accessibility Considerations, Architecture Decisions, Auth / authorization, `CatalogRepository` — final method list, Conformance suite (must pass for both adapters — `npm run test:conformance`), Constants, Core storage: schema, repository wiring, indexed lookup (+13 more)

### Community 112 - "Files To Create or Modify"
Cohesion: 0.10
Nodes (20): Acceptance Checklist, Accessibility Considerations, Architecture Decisions, Conformance suite, Constants / enums, Customers domain (`src/domains/customers/`) — store credit, Documentation, Events infrastructure (+12 more)

### Community 113 - "Files To Create or Modify"
Cohesion: 0.10
Nodes (20): A. Shared value types (needed by multiple contexts), Acceptance Checklist, Accessibility Considerations, Architecture Decisions, B. Repository interfaces — canonical `repository.ts` per bounded context (10 files), C. New domain entity types (plain TS, no engine types), D. Storage core — `src/infrastructure/storage/core/`, E. In-memory reference adapter — `src/infrastructure/storage/adapters/memory/` (+12 more)

### Community 114 - "Completed"
Cohesion: 0.10
Nodes (20): 10. Storage Layer ✓, 11. Documentation ✓, 1. Enums & Constants ✓, 1. Sales Integration, 2. Entities ✓, 2. Refund Action, 3. Ports & Interfaces ✓, 3. Tests (+12 more)

### Community 115 - "✅ Completed (Foundation Layer)"
Cohesion: 0.10
Nodes (19): Acceptance Criteria Status, Architecture Decisions Implemented, ✅ Completed (Foundation Layer), Conformance Tests (Not Yet Implemented), Core Infrastructure, Domain Entities, Domain Repository Interface, Domain Services (+11 more)

### Community 116 - "Runtime-Extensible System Enums — Implementation Plan"
Cohesion: 0.11
Nodes (18): Acceptance Checklist, Accessibility Considerations, Admin UI (OWNER-gated), Architecture Decisions, Authorization helper (small addition, existing file), Completing a sale with a runtime payment method, Conformance suite, Constants (enums + label maps) (+10 more)

### Community 117 - "Payment System Architecture"
Cohesion: 0.11
Nodes (17): 1. Webhook Signature Verification, 2. Idempotent Event Store, 3. Async Status Reconciliation, 4. Authorization and Permissions, Adding a New Gateway, Charges, Gateway-Level Idempotency, Gateway Table (+9 more)

### Community 118 - "Implementation Plan — `domains/auth` (TAHFIUM auth: credentials, JWT sessions, guard, PIN re-auth, rate limiting)"
Cohesion: 0.11
Nodes (17): Acceptance Checklist, Accessibility Considerations, Architecture Decisions, Create — constants, Create — domain (`src/domains/auth`), Create — infrastructure (`src/infrastructure`), Create — ports (`src/shared/ports`), Create — tests (+9 more)

### Community 119 - "Plan: domains/inventory — StockMovement ledger, StockLevel, reconciliation, adjustment/transfer/low-stock/stocktake UI"
Cohesion: 0.12
Nodes (16): Acceptance Checklist, Accessibility Considerations, Architecture Decisions, Conformance suite (the acceptance gate), Constants / enums, Core storage: schema, repositories, driver fix, Domain: inventory entities, repository, services, Files To Create or Modify (+8 more)

### Community 120 - "Storage Adapter Authoring Guide"
Cohesion: 0.12
Nodes (15): 1. Scaffold the Adapter, 2. Implement StorageDriver, 3. Register the Adapter, 4. Wire It Up (One Config Change), 5. Configure the App to Use It, Adapter Conformance, Checklist, Effort Estimate (+7 more)

### Community 121 - "receipt-print-orchestrator.test.ts"
Cohesion: 0.28
Nodes (8): ReceiptActions(), InProcessJobRunner, getRegisteredPrinters(), printReceipt(), PrintRecipeOutcome, Job, JobResult, JobRunner

### Community 122 - "Plan — Storage conformance suite: one reusable spec every adapter must pass, auto-expanded per adapter in CI"
Cohesion: 0.13
Nodes (14): A. The conformance suite (new directory — the card's deliverable), Acceptance Checklist, Accessibility Considerations, Architecture Decisions, B. Core extension (minimal, additive, backward-compatible), C. Consolidate the pre-existing driver-level conformance (avoid two suites), D. Package + CI wiring, Files To Create or Modify (+6 more)

### Community 124 - "printer-registry.ts"
Cohesion: 0.35
Nodes (5): PrinterNotRegisteredError, PrinterFactory, registerPrinter(), registry, resolvePrinter()

### Community 125 - "escpos-encoder.ts"
Cohesion: 0.38
Nodes (8): encodeReceipt(), encodeString(), formatDate(), formatPrice(), padCenter(), padLeft(), padRight(), truncate()

### Community 126 - "IndexedDB Storage Adapter"
Cohesion: 0.20
Nodes (9): Architecture, Backups, Browser Support, Ephemeral vs. Production, Error Handling, IndexedDB Storage Adapter, Multi-Tab Behavior, Schema Versioning (+1 more)

### Community 128 - "page.tsx"
Cohesion: 0.60
Nodes (4): ReceiptPage(), ReceiptPageProps, resolveSettings(), buildReceiptDocument()

### Community 130 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **643 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `arrowParens` (+638 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildVersionChain()` connect `index.ts` to `dependencies`, `IndexedDBDriver`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `dexie` connect `dependencies` to `index.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _643 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CatalogRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.060350877192982454 - nodes in this community are weakly interconnected._
- **Should `CoreOrganizationRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.05220883534136546 - nodes in this community are weakly interconnected._
- **Should `fixtures.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08210526315789474 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._