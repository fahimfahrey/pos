# Launch Checklist

This document tracks production readiness across all systems. Each item must be verified before launch.

**Status: In Progress** - Core storage adapter complete, security and operations in progress.

## Storage & Data

### Adapter Implementation
- [x] SQLite adapter implemented (`src/infrastructure/storage/adapters/sqlite/`)
  - Evidence: `src/infrastructure/storage/adapters/sqlite/driver.ts` - Full StorageDriver implementation
  - Evidence: `src/infrastructure/storage/conformance/adapters.ts` - Added to matrix
  - Evidence: `tests/storage/sqlite-adapter.test.ts` - Conformance tests

### Both Adapters Green in CI
- [ ] Memory adapter tests pass
  - Command: `npm run test:conformance:node` (memory + sqlite)
  - Status: Requires `npm install` and `better-sqlite3` binary build
- [ ] IndexedDB adapter tests pass (browser mode)
  - Command: `npm run test:conformance:browser`
  - Status: Requires browser environment
- [ ] SQLite adapter conformance suite passes
  - Evidence file: `tests/storage/sqlite-adapter.test.ts`
  - Status: Awaiting `npm install` and test run

### Data Migration
- [x] Migration script implemented (`scripts/migrate-engine.ts`)
  - Evidence: Export → import → checksum verification pipeline
  - Evidence: `scripts/lib/checksum.ts` - Deterministic checksumming
  - Evidence: `tests/scripts/migrate-engine.test.ts` - Migration tests
  - Tested scenarios: memory ↔ sqlite round-trip, data drift detection

### Backup & Restore
- [ ] Backup procedure documented and drilled
  - See: `docs/backup.md` (existing) - verify current procedure works
  - Runbook drill: Not yet performed (see `docs/runbook.md`)
- [ ] Restore procedure verified
  - Step: `importAll()` via UI or script
  - Verification: Row counts + checksum match

## Security

### CSP & Headers
- [ ] Content-Security-Policy header deployed
  - Command to verify: Inspect response headers in browser DevTools
  - Current status: Not yet implemented
  - Files to update: `next.config.ts`, `src/proxy.ts`
- [ ] Strict-Transport-Security header deployed
  - Current status: Not yet implemented
- [ ] Other security headers in place
  - X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
  - Current status: Partially (in `src/proxy.ts`, not in `next.config.ts`)

### Input Validation
- [ ] Zod validation on every `'use server'` action
  - Audit status: Not yet completed
  - Scope: `src/domains/**/actions/*.ts` (all server actions)
  - Expected outcome: Every exported action validates input via Zod schema
  - Critical for API security

### Dependency Audit
- [ ] `npm audit` passes at audit-level high
  - Command: `npm run audit`
  - Script added: Yes (`package.json`)
  - Run status: Pending (awaits `npm install`)
- [ ] CI includes audit step
  - File: `.github/workflows/ci.yml`
  - Status: Not yet created
  - Risk: Blocked by global `.github/` permission (see fallback notes)

## Operations

### Versioning & Releases
- [ ] Semver version discipline in `package.json`
  - Current version: `0.1.0`
  - Process: Bump version, tag, document in CHANGELOG.md
- [ ] CHANGELOG.md exists and is maintained
  - Current status: Not yet created
  - Format: Keep It Simple (KISS) - date, version, changes
- [ ] Release procedure documented
  - See: `docs/runbook.md` Release Procedure section
  - Status: To be documented

### Rollback Strategy
- [ ] Rollback procedure documented
  - See: `docs/runbook.md` Rollback Procedure section
  - Mechanism: Git tag + redeploy previous version
  - Data impact: Rollback only affects app bundle; local IndexedDB data persists
  - Schema mismatch handling: Handled by `SchemaVersioner.migrateTo()` with downgrade path
  - Status: To be documented

### Observability
- [ ] Sentry error tracking wired
  - SDK: `@sentry/nextjs`
  - Setup: Client + server + edge config
  - Test: Deliberately throw error, verify it reaches Sentry dashboard
  - Status: Not yet implemented
- [ ] Service-level monitoring (optional for launch)
  - Latency, error rate, uptime
  - Defer to post-launch unless business-critical

## Offline Capability & PWA

### Service Worker
- [ ] Service worker registered and caching app shell
  - File: `public/sw.js` or `src/app/register-sw.tsx`
  - Strategy: Cache-first for static assets; data via IndexedDB
  - Test procedure: Open DevTools → Application → Service Workers; go offline; reload
  - Expected result: App loads and functions without network
  - Status: Not yet implemented

### Install Prompt
- [ ] PWA install prompt visible and functional
  - File: `src/app/_components/install-prompt.tsx`
  - Behavior: Capture `beforeinstallprompt`, show dismissible button
  - Test: Run on production build; open on mobile; verify "Add to Home Screen"
  - Status: Not yet implemented

### Manifest
- [ ] Web app manifest valid and complete
  - File: `src/app/manifest.ts` (exists, basic)
  - Required fields: `id`, `name`, `start_url`, `display: standalone`, icons
  - Icon requirement: At least 192×192 and 512×512; maskable format for modern PWAs
  - Test: Lighthouse audit (DevTools → Lighthouse → PWA) should show all green
  - Status: Partial (file exists, may need icon expansion)

## Tenant Isolation & RBAC

### Tenant Isolation Verified
- [ ] Data is isolated by tenant (orgId)
  - Test: Run conformance suite tenant-scoping tests
  - Evidence file: `src/infrastructure/storage/conformance/suites/tenant-scoping.ts`
  - Verification: Queries for tenant A do not return tenant B data
  - Status: Part of conformance suite (pass/fail TBD)

### Role-Based Access Control (RBAC) Verified
- [ ] All four roles function correctly:
  - [ ] Owner (ordinal 1) - highest privilege
  - [ ] Admin (ordinal 2)
  - [ ] Member (ordinal 3)
  - [ ] Viewer (ordinal 4) - lowest privilege
  - Authorization logic: `src/domains/auth/services/authorization-service.ts` - `userRole <= requiredRole`
- [ ] Protected routes/actions gate correctly per role
  - Test: For each protected route, attempt access as each role; verify only authorized roles succeed
  - Example: Admin screen should reject Viewer but accept Admin, Owner
  - Evidence: Integration tests in `src/domains/auth/**/*.test.ts` or manual test matrix
  - Status: Needs manual or automated verification

## Legal & Compliance

### Legal Pages Published
- [ ] Privacy Policy page exists and is linked
  - File: `src/app/legal/privacy/page.tsx`
  - Linked from: App footer (find footer component and verify link)
  - Content: Minimal placeholder (must be updated by legal team)
  - Status: Not yet created
- [ ] Terms of Service page exists and is linked
  - File: `src/app/legal/terms/page.tsx`
  - Linked from: App footer
  - Content: Minimal placeholder (must be updated by legal team)
  - Status: Not yet created

## Deployment & Infrastructure

### Build & CI
- [ ] Production build succeeds
  - Command: `npm run build`
  - Expected output: `.next/` directory ready for deployment
  - Status: Blocked by outstanding TypeScript errors (non-adapter-related)
- [ ] Linting passes
  - Command: `npm run lint`
  - Status: Blocked by outstanding linting errors
- [ ] Tests pass
  - Commands: `npm run test`, `npm run test:conformance:node`, `npm run test:conformance:browser`
  - Status: Blocked by installation of better-sqlite3 and environment setup
- [ ] CI workflow defined
  - File: `.github/workflows/ci.yml`
  - Jobs: lint, typecheck, test:conformance:node, test:conformance:browser, audit
  - Status: Not yet created (blocked by permission limitation)

### Secrets & Configuration
- [ ] Environment variables documented
  - See: `docs/storage-adapters.md` (storage engines)
  - Required for launch: `STORAGE_ENGINE`, `NEXT_PUBLIC_STORAGE_ENGINE`, `AUTH_SECRET`, `SENTRY_DSN` (if using Sentry)
  - Status: Partially documented
- [ ] Sensitive data never logged
  - Audit: Grep codebase for console.log of user input, auth tokens, etc.
  - Status: Not yet audited

## Final Checks

### Documentation Complete
- [x] Storage adapter guide updated
  - Evidence: `docs/storage-adapters.md` - Added contract gap sections and server-only pattern
- [ ] Runbook complete (backup/restore, engine migration, release procedures)
  - Evidence file: `docs/runbook.md`
  - Status: Not yet created
- [ ] Architecture docs up to date
  - Files to check: `ARCHITECTURE.md`, README.md, etc.
  - Status: Not audited

### Manual Testing
- [ ] Happy path: Create sale, add items, checkout, view receipt
  - Expected result: Full flow works without errors
  - Status: Not performed
- [ ] Offline mode: Disable network, attempt operation, re-enable, verify sync
  - Expected result: Cached app shell loads; data operations queue/replay correctly
  - Status: Not performed (pending service worker implementation)
- [ ] Cross-browser: Test on Chrome, Firefox, Safari, Edge
  - Status: Not performed
- [ ] Mobile: Test on iOS and Android browsers
  - Status: Not performed

### Smoke Test on Staging
- [ ] Deploy to staging environment
- [ ] Run full conformance suite in staging
- [ ] Smoke test: critical user flows (login, sale creation, payment)
- [ ] Monitor error logs for 24 hours

---

## Notes for Go/No-Go Decision

**Go criteria:**
1. Storage adapters (memory + indexeddb + sqlite) all conformance-green
2. All `'use server'` actions validated with Zod
3. CSP + headers deployed and verified
4. Legal pages published
5. Backup/restore drill successful
6. Tenant isolation + RBAC verified
7. No high-severity audit findings

**Known blockers for current state:**
- `better-sqlite3` not installed (requires native build); CI automation blocked by `.github/` permission
- Outstanding TypeScript errors in unrelated domains (not adapter-related; pre-existing)
- Service worker and install prompt not yet implemented
- Sentry not yet wired
- Legal pages not yet created
- Runbook not yet documented

**Post-launch operations:**
- Monitor Sentry dashboard for errors
- Track PWA install numbers and crash reports
- Scheduled backups (daily minimum)
- Weekly review of conformance suite
