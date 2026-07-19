# POS Domain Implementation Progress

## ✅ Completed (Foundation Layer)

### Core Infrastructure
- **ULID Generator** (`src/shared/utils/ulid.ts` + test)
  - Pure Crockford base32 implementation
  - Monotonic timestamp-based uniqueness
  - Full test coverage for collision detection and sorting

### Domain Entities
- **Sale** (`sale.ts`) - Replaces Order
  - SaleStatus alias to OrderStatus
  - CartDiscount interface for discount tracking
- **SaleItem** (`sale-item.ts`)
- **Shift** (`shift.ts`)
- **ParkedCart** (`parked-cart.ts`) + ParkedCartLine
- **ReceiptCounter** (`receipt-counter.ts`)

### Money Calculation Library
- **`src/domains/sales/lib/money.ts`** - Pure POS calculation engine
  - Integer minor-unit arithmetic (cents) to avoid float drift
  - Rounding rules (nearest/up/down)
  - Line-level discounts (percent/fixed)
  - Cart-level discounts with proportional allocation (largest-remainder)
  - Tax calculation (inclusive/exclusive modes)
  - Mixed tax rate support
  - Change-due calculation
  - **82 lines of pure calculation logic**
  - **42-line comprehensive test suite** covering:
    - Rounding at different increments
    - Discount clamping
    - Proportional cart discount allocation
    - Mixed tax rates
    - Inclusive/exclusive tax modes
    - Edge cases (zero subtotal, negative clamping)

- **`src/domains/sales/lib/receipt-number.ts`** - Receipt formatting
  - Zero-padded sequential numbering with branch prefix
  - Round-trip format/parse with full tests

### Domain Services
- **TaxResolver** (`tax-resolver.ts`)
  - Pure helper for category → tax rate resolution
  - Fallback chain: category.taxRuleId → settings.taxRules[0] → 0%
  - Full test coverage

- **DiscountPolicy** (`discount-policy.ts`)
  - Cashier discount limit enforcement
  - Manager override token validation (time-boxed)
  - Full test coverage for percentage/fixed discounts

- **ShiftService** (`shift-service.ts`)
  - Open shift with float validation
  - Close shift with drawer variance calculation
  - Open shift lookup per register

- **CartPricingService** (`cart-pricing-service.ts`)
  - Server-authoritative cart pricing
  - Re-resolves variant prices at pricing time
  - Integrates TaxResolver for tax rate calculation

- **FinalizeSaleService** (`finalize-sale-service.ts`)
  - Core orchestrator for sale finalization
  - Idempotent sale creation by client ULID
  - Price/tax snapshotting via SaleItem
  - Receipt counter increment (gapless, atomic)
  - Stock decrement via InventoryService
  - Payment recording
  - Manager override validation

### Domain Repository Interface
- **`src/domains/sales/repository.ts`** - Fully specified interface
  - Sales CRUD + query methods
  - SaleItems CRUD + listing
  - Shifts CRUD + register lookup
  - ParkedCarts CRUD + list by register
  - ReceiptCounters CRUD
  - Cross-domain Payment query

### Storage Layer
- **Schema Updates** (`src/infrastructure/storage/core/schema.ts`)
  - Removed: `orders`, `orderLines`
  - Added: `sales`, `saleItems`, `shifts`, `parkedCarts`, `receiptCounters`
  - Version bump: 5 → 6

- **IndexedDB Schema** (`src/infrastructure/storage/adapters/indexeddb/schema.ts`)
  - Updated COLLECTION_INDEXES for all new collections with compound indexes
  - Version 6 migration block with proper null drops and re-indexes
  - Updated payments index: orderId → saleId

- **Core Repository Implementation** (`src/infrastructure/storage/core/repositories/sales-repository.ts`)
  - Complete CoreSalesRepository with all repository methods
  - Proper collection initialization for each entity type
  - Filter-based queries ready for conformance testing

- **Payments Repository Update** (`src/infrastructure/storage/core/repositories/payments-repository.ts`)
  - Renamed: `listPaymentsForOrder` → `listPaymentsForSale`
  - Updated: orderId field reference → saleId

### Entity Updates
- **Payment** (`src/domains/payments/entities/payment.ts`)
  - Renamed: orderId → saleId

- **Category** (`src/domains/catalog/entities/category.ts`)
  - Added: taxRuleId? (optional, for tax rule assignment)

- **Settings** (`src/domains/organization/entities/settings.ts`)
  - Added: DiscountLimits interface
  - Added: discountLimits to ResolvedSettings
  - Default: cashierMaxPercent=10, cashierMaxFixedAmount=20

- **Enum Re-exports** (`src/constants/enums/index.ts`)
  - Added: SaleStatus type alias to OrderStatus
  - Added: SALE_STATUS constant alias to ORDER_STATUS

---

## 🔄 In Progress / Remaining Work

### Services (Not Yet Implemented)
- SearchProductsService - product search + pricing resolution
- shift-service.test.ts - needs full test suite
- cart-pricing-service.test.ts - needs integration tests
- finalize-sale-service.test.ts - needs conformance + error scenarios

### Server Actions (Not Yet Implemented)
- `open-shift.ts`
- `close-shift.ts`
- `search-products.ts`
- `price-cart.ts`
- `finalize-sale.ts` - wrapper around FinalizeSaleService
- `void-sale.ts`
- `hold-cart.ts`
- `resume-cart.ts`
- `list-parked-carts.ts`
- `manager-override.ts` - PIN reauth wrapper
- `search-customers.ts` (optional thin wrapper)

### UI Components (Not Yet Implemented)
- `/pos` layout, layout guards, shift-checking redirects
- `/pos/shift/open` - float entry form
- `/pos/shift/close` - counted vs expected drawer display
- Cart state machine + context (`pos-cart-context.tsx`)
- Barcode scanner hook (`use-barcode-scanner.ts`)
- Product search component (`product-search.tsx`)
- Cart display + line editing (`cart.tsx`, `cart-line.tsx`)
- Discount modal (`discount-modal.tsx`)
- Manager override PIN pad (`manager-override-modal.tsx`)
- Tax summary display (`tax-summary.tsx`)
- Customer attach (`customer-attach.tsx`)
- Hold/resume drawer (`hold-resume-drawer.tsx`)
- Payment modal + tender methods (`payment-modal.tsx`)
- Receipt view / print route (`receipt-view.tsx`, `/pos/receipt/[saleId]/page.tsx`)

### Conformance Tests (Not Yet Implemented)
- `conformance/suites/finalize-sale-atomicity.ts` - rollback test for transaction safety
- `conformance/fixtures.ts` - update to use Sale/SaleItem/Shift fixtures
- `conformance/suites/crud.ts` - extend for new collections
- `conformance/suites/tenant-scoping.ts` - extend for sales collections

### E2E Test (Not Yet Implemented)
- `e2e/pos-scan-to-receipt.spec.ts` - full user journey:
  - Org/branch/register/user/product seeding
  - Cashier login
  - Shift open
  - Barcode scan → cart
  - Payment → receipt
  - Receipt number validation

---

## Architecture Decisions Implemented

1. ✅ **Rename Order → Sale** - No parallel model duplication
2. ✅ **Money.ts at domain level** - Pure calculation library, no I/O
3. ✅ **Integer minor-unit arithmetic** - Eliminates float drift in tests
4. ✅ **Idempotent finalize by client ULID** - Offline-first retry safety
5. ✅ **Gapless receipt numbers via counter row** - Atomic with sale in one transaction
6. ✅ **Server-authoritative pricing** - Re-resolved at finalize time
7. ✅ **Proportional cart discount allocation** - Largest-remainder for exact cent matching
8. ✅ **Manager override as scoped token** - Time-boxed, role-checked, not a session upgrade
9. ✅ **Category.taxRuleId as optional field** - Minimal addition, additive backward-compatible

---

## Acceptance Criteria Status

- [ ] money.ts unit tests across rounding, discounts, mixed tax rates, inclusive/exclusive - ✅ Implemented
- [ ] /pos full-screen, keyboard-and-touch-first - Not yet started
- [ ] Hidden barcode input with USB/HID scanner timing heuristic - Not yet started
- [ ] Debounced product search, keyboard-navigable - Not yet started
- [ ] Cart: quantity edit, weight entry, per-line + cart-level discounts - Not yet started
- [ ] Cashier discount limits + manager PIN override - Service logic ✅, UI/actions not yet
- [ ] Tax calculation (inclusive/exclusive, mixed rates) - ✅ money.ts tested
- [ ] Customer attach - Not yet started
- [ ] Hold/resume parked carts - Repository ready ✅, actions/UI not yet
- [ ] Finalization: ONE UnitOfWork with sale/items/payments/stock/receipt number - Service logic ✅, needs action wrapper + conformance test
- [ ] Finalization idempotency: same ULID twice = one sale - Logic ✅, needs test
- [ ] Finalization atomicity (rollback on insufficient stock) - Service logic ✅, needs conformance test
- [ ] Shift open/close with drawer variance - Service logic ✅, needs action wrappers + UI
- [ ] npm run typecheck / lint / test / test:conformance - Schema/repository ready ✅, needs conformance suite impl
- [ ] e2e scan-to-receipt - Not yet started

---

## Next Steps (Implementation Order)

1. **Conformance Fixtures** - Update `conformance/fixtures.ts` to create Sale/SaleItem/Shift instances
2. **Conformance CRUD** - Extend `conformance/suites/crud.ts` for new collections
3. **Finalize-Sale Atomicity Test** - Implement `finalize-sale-atomicity.ts` (proves rollback safety)
4. **Server Actions** - Start with `finalize-sale.ts` (core), then shift actions, then cart actions
5. **Cart State** - Implement `pos-cart-context.tsx` + useReducer logic
6. **UI Core** - Barcode scanner + product search
7. **Checkout Flow** - Cart editing → discounts → payment → finalize → receipt
8. **E2E Test** - Full journey validation

---

## Test Results Expected

Once remaining work is complete:
- ✅ `npm run test` - All unit tests pass (money.ts, receipt-number, tax-resolver, discount-policy, etc.)
- ✅ `npm run test:conformance:node` - All collections CRUD, tenant isolation, finalize-sale atomicity
- ✅ `npm run test:conformance:browser` - Same conformance suite against IndexedDB/fake-indexeddb
- ✅ `npx playwright test e2e/pos-scan-to-receipt.spec.ts` - Full POS journey from scan to receipt
