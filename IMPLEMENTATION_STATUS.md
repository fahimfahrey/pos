# Catalog Domain Implementation Status

## Overview
This document tracks the implementation of the catalog domain (Product, ProductVariant, Category, PriceList) and related infrastructure per the plan in `docs/superpowers/specs/plan-card_1784266069993_7_1fs9.md`.

## Completed Components

### Domain Entities ✅
- `src/domains/catalog/entities/category.ts` — Category with orgId
- `src/domains/catalog/entities/product.ts` — Product (non-sellable grouping)
- `src/domains/catalog/entities/product-variant.ts` — ProductVariant (sellable unit, barcode, decimal-quantity)
- `src/domains/catalog/entities/price-list.ts` — PriceList and PriceListEntry (effective-dated)

### Repository & Schema ✅
- `src/domains/catalog/repository.ts` — Full CatalogRepository interface with intent-named methods
- `src/infrastructure/storage/core/schema.ts` — Updated COLLECTIONS map, v3→v4 version bump
- `src/domains/catalog/schemas/catalog.schema.ts` — Zod schemas for all entities + CSV row validation

### Storage Core ✅
- `src/infrastructure/storage/core/driver.ts` — Added optional `getByIndex?` method to DriverTransaction
- `src/infrastructure/storage/core/collection.ts` — Added `findByIndex(index, key, fallbackPred)` method

### IndexedDB Adapter ✅
- `src/infrastructure/storage/adapters/indexeddb/schema.ts` — Updated COLLECTION_INDEXES (catalogProducts, catalogProductVariants, priceLists, priceListEntries with compound indexes); added v4 version chain with migration
- `src/infrastructure/storage/adapters/indexeddb/driver.ts` — Implemented `getByIndex` using Dexie `.where(index).equals(key).first()`

### CoreCatalogRepository ✅
- `src/infrastructure/storage/core/repositories/catalog-repository.ts` — Complete rewrite implementing all repository methods
  - Categories: saveCategory, findCategoryById, listCategoriesByOrg, deleteCategory
  - Products: saveProduct, findProductById, listProductsByOrg, searchProductsByName, deleteProduct
  - Variants: saveVariant, findVariantById, findVariantBySku, findVariantByBarcode (indexed), listVariantsByProduct, listVariantsByOrg, deleteVariant
  - Price Lists: savePriceList, findPriceListById, listPriceListsByOrg, savePriceListEntry, listPriceListEntries, findEffectivePrice

### Authorization ✅
- `src/domains/auth/services/authorization-service.ts` — Added `requireAdminMembership` function

### Services ✅
- `src/domains/catalog/services/catalog-service.ts` — CatalogService with CRUD methods, conflict checking, event publishing
- `src/domains/catalog/services/catalog-query-service.ts` — CatalogQueryService with listVariantsPage (paginated/searchable) and resolveEffectivePrice
- `src/domains/catalog/services/barcode-encoder.ts` — EAN-13 and Code-128 encoders (pure functions, no dependencies)
- `src/domains/catalog/services/csv.ts` — CSV parser, template builder, row validator, import with upsert-by-SKU

### Events ✅
- `src/shared/ports/event-bus.ts` — EventBus<E> generic interface
- `src/infrastructure/adapters/in-process-event-bus.ts` — InProcessEventBus implementation (synchronous fan-out)
- `src/domains/catalog/events.ts` — CatalogEvent union type (product/variant/category/pricelist created/updated/deleted)
- `src/infrastructure/events/catalog-event-bus.ts` — Module-level catalogEventBus singleton

### FileStore ✅
- `src/shared/ports/file-store.ts` — FileStore interface (save/load/delete)
- `src/infrastructure/files/adapters/memory/memory-file-store.ts` — Map-backed implementation
- `src/infrastructure/files/adapters/indexeddb/indexeddb-file-store.ts` — IndexedDB implementation (pos-files DB, files object store)
- `src/infrastructure/files/default-provider.ts` — createDefaultFileStore() factory (SSR-safe)

### Server Actions ✅
- `src/domains/catalog/actions/save-product.ts` — Create/update product
- `src/domains/catalog/actions/save-variant.ts` — Create/update variant
- `src/domains/catalog/actions/list-variants.ts` — List with pagination, search, category filter

### Unit Tests ✅
- `src/domains/catalog/services/barcode-encoder.test.ts` — EAN-13 checksum, Code-128 encoding
- `src/domains/catalog/services/csv.test.ts` — CSV parsing, row validation, import flow
- `src/infrastructure/adapters/in-process-event-bus.test.ts` — Pub/sub, unsubscribe, ordering

## Partially Completed / Still Needed

### Server Actions (Not Yet)
- `save-category.ts` — Create/update category
- `delete-product.ts`, `delete-variant.ts`, `delete-category.ts` — Delete operations
- `save-price-list.ts`, `save-price-list-entry.ts` — Price list management
- `import-csv.ts` (two-phase: preview + commit)
- `export-csv-template.ts` — Download template

### UI Components (Not Yet)
- `src/app/catalog/layout.tsx` — Auth guard, nav
- `src/app/catalog/page.tsx` — Main list page with search params
- `src/app/catalog/_components/catalog-table.tsx` — Paginated table (name, SKU, barcode, category)
- `src/app/catalog/_components/search-box.tsx` — Debounced search
- `src/app/catalog/_components/category-filter.tsx` — Category dropdown filter
- `src/app/catalog/new/page.tsx` and `[productId]/edit/page.tsx` — Product+variant CRUD forms
- `src/app/catalog/_components/product-form.tsx` — Form component with useActionState, inline validation
- `src/app/catalog/_components/image-upload.tsx` — Image upload via FormData
- `src/app/catalog/import/page.tsx` — CSV import with preview (per-row status, errors)
- `src/app/catalog/labels/page.tsx` — Barcode label generation/print
- `src/app/catalog/_components/barcode-label.tsx` — SVG barcode rendering
- `src/app/api/catalog/files/[fileId]/route.ts` — File blob streaming
- `src/app/api/catalog/csv-template/route.ts` — CSV template download

### Tests (Not Yet)
- `src/domains/catalog/schemas/catalog.schema.test.ts` — Zod schema boundaries
- `src/domains/auth/services/authorization-service.test.ts` — requireAdminMembership
- `e2e/catalog.spec.ts` — Playwright: create/edit, search/filter, CSV import, label generation
- Conformance suite updates:
  - `src/infrastructure/storage/conformance/fixtures.ts` — makeCatalogProduct, makeProductVariant, etc.
  - `src/infrastructure/storage/conformance/suites/crud.ts` — CRUD for 4 new collections
  - `src/infrastructure/storage/conformance/suites/catalog-barcode-lookup.ts` — findVariantByBarcode/findVariantBySku with cross-org isolation
  - `src/infrastructure/storage/conformance/suites/tenant-scoping.ts` — Extend for productVariants

## Key Design Decisions Implemented

1. **Collection naming**: Used `catalogProducts`, `catalogProductVariants` (not `products`, `productVariants`) to avoid collision with inventory domain's `products` collection.

2. **Optional getByIndex**: Added to DriverTransaction as optional method. IndexedDBDriver implements it; MemoryDriver falls back to linear scan via Collection.findByIndex.

3. **Compound indexing**: ProductVariant uses `[orgId+sku]` and `[orgId+barcode]` indexes for tenant-scoped lookups.

4. **Repository-level uniqueness**: SKU and barcode uniqueness enforced in CatalogService.createVariant/updateVariant before saving (since driver contract has no unique-constraint primitive).

5. **Effective price resolution**: CatalogQueryService.resolveEffectivePrice filters by date range and returns latest-wins on overlapping ranges.

6. **Event bus is in-process, synchronous**: Catalog actions publish after successful transaction commit. Designed for future queue/push replacement via interface swap.

7. **FileStore as separate port**: Parallel to StorageDriver, with its own registry pattern. IndexedDBFileStore uses separate `pos-files` DB for blob isolation.

## Verification Notes

- Import paths follow `boundaries/no-unknown` eslint rules (domain imports wrapped with eslint-disable comments).
- Service methods use provider.withTransaction pattern from system-enums reference implementation.
- Event publishing happens after successful transaction commit (never inside tx, so rollbacks don't leak).
- CSV parser handles quoted fields, embedded commas/newlines, CRLF/LF, escaped quotes.
- Barcode encoder functions are pure (no DOM, no async).
- Schema version bumped to 4; IndexedDB v4 chain handles v3→v4 migration (drops catalogItems, re-indexes categories with orgId, adds 4 new stores).

## Next Steps (After This PR)

1. Create remaining server actions (delete, price-list, import-csv, export-csv-template).
2. Build UI layer (pages, components, forms, CSV import, label generation).
3. Extend conformance suite (fixtures, CRUD, barcode-lookup, tenant-scoping).
4. Add remaining unit tests (schema, authorization).
5. Write e2e tests (Playwright catalog.spec.ts).
6. Final verification: `npm run test && npm run test:conformance:node && npm run test:conformance:browser && npx playwright test e2e/catalog.spec.ts`.

## Files Modified/Created Summary

**Modified:**
- src/domains/catalog/repository.ts
- src/domains/auth/services/authorization-service.ts
- src/infrastructure/storage/core/schema.ts
- src/infrastructure/storage/core/driver.ts
- src/infrastructure/storage/core/collection.ts
- src/infrastructure/storage/core/repositories/catalog-repository.ts
- src/infrastructure/storage/adapters/indexeddb/schema.ts
- src/infrastructure/storage/adapters/indexeddb/driver.ts

**Created (26 files):**
- Entities (4): category.ts, product.ts, product-variant.ts, price-list.ts
- Schemas (1): catalog.schema.ts
- Services (4): barcode-encoder.ts, csv.ts, catalog-service.ts, catalog-query-service.ts
- Events (2): events.ts, src/infrastructure/events/catalog-event-bus.ts
- Ports (2): src/shared/ports/event-bus.ts, src/shared/ports/file-store.ts
- Infrastructure (5): in-process-event-bus.ts, memory-file-store.ts, indexeddb-file-store.ts, default-provider.ts (files)
- Actions (3): save-product.ts, save-variant.ts, list-variants.ts
- Tests (3): barcode-encoder.test.ts, csv.test.ts, in-process-event-bus.test.ts

---

**Status: 65% Implementation Complete** (domain layer + core infrastructure + sample actions + unit tests)
**Remaining: 35%** (UI layer, additional actions, conformance suite, e2e tests)
