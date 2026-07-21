# State Matrix: First-Class Non-Happy States

Implementation status for every route's loading, empty, error, and offline states.

| Route | Loading | Empty | Error | Offline |
|-------|---------|-------|-------|---------|
| `/` (marketing) | N/A — static content | N/A | N/A | N/A |
| `(auth)/login` | N/A — static form | N/A | `RouteError` (inline, kind=user\|system) in `login/page.tsx:26-33` | `OfflineBanner` with offline-sign-in-capable copy in `login/page.tsx:19` |
| `(auth)/signup` | N/A — static form | N/A | `RouteError` (inline, kind=system) in `signup/page.tsx:24-32` | `OfflineBanner` with "signup needs connection" copy in `signup/page.tsx:15` |
| `(dashboard)/app` | `loading.tsx` (skeleton grid) | `EmptyState` ("No sales yet") in `page.tsx:81-87` | `RouteError` (kind=system) rendered in catch block in `page.tsx:104-111` | N/A — dashboard is authenticated-only, no offline capability designed |
| `admin/audit` | `loading.tsx` (skeleton table) — **NEEDED** | `EmptyState` with "No audit entries" — **NEEDED** | `RouteError` (kind=system) for failed `listAuditEntriesAction()` — **NEEDED** / `RouteError` (kind=user) for "No organization selected" and "Insufficient role" — **NEEDED** | N/A |
| `admin/enum-values` | `loading.tsx` (skeleton table) — **NEEDED** | `EmptyState` with "No enum values" — **NEEDED** | `RouteError` (kind=system) for failed reads — **NEEDED** / `RouteError` (kind=user) for gates — **NEEDED** | N/A |
| `pos/checkout` | `SkeletonRows` grid in `register-shell.tsx:26-40` | Covered by `empty-cart-state.tsx` (existing, unchanged) | `RouteError` (kind=system) in `register-shell.tsx:44` | `OfflineBanner` (compact mode, pending count) in `register-header.tsx:79` |
| `pos/display` | N/A | `EmptyState` for "no active cart" — **NEEDED** in `display-cart-view.tsx` | `RouteError` (kind=user) for missing registerId in `display/page.tsx` — **NEEDED** | N/A — inherits register state via BroadcastChannel |
| `pos/receipt/[saleId]` | `loading.tsx` (skeleton receipt shape) — **NEEDED** | N/A | `error.tsx` (kind=system) for storage failures — **NEEDED** / `notFound()` for genuinely missing sales — already correct behavior | N/A |
| `(onboarding)/onboarding` | N/A | N/A | `RouteError` for async step failures — **NEEDED** | `OfflineBanner` blocking submit, with "setup requires connection" copy — **NEEDED** |

## Implementation Notes

- **✓ Completed**: Root chrome (`/app/loading.tsx`, `/app/error.tsx`, `/app/not-found.tsx`), login/signup pages with RouteError + OfflineBanner, dashboard with real data + loading/error, register-shell with skeleton + RouteError, register-header with OfflineBanner
- **● In Progress**: Shared components (RouteError, OfflineBanner, SkeletonRows) — all created with Storybook stories
- **○ Remaining** (marked as `—NEEDED`): Admin pages (audit, enum-values), display page empty state, receipt loading/error, onboarding error + offline handling

## Architecture Decisions Applied

1. **Skeletons opt-in per route** — dashboard and receipt get `loading.tsx` for genuine waits; static pages (marketing, login, signup) skip them.
2. **Error kinds (user vs system)** — login action returns `errorKind` discriminant; RouteError renders different UI per kind.
3. **Storage error mapping** — `getStorageErrorMessage()` maps error codes to plain language in `src/shared/lib/storage-error-messages.ts`.
4. **Shared primitives** — `RouteError`, `OfflineBanner`, `SkeletonRows` in `src/shared/components/ui/`.
5. **Promoted pending-sync** — moved `useOutboxCount` → `usePendingSyncCount` to shared; checkout still imports via backwards-compat alias.
6. **Dashboard data wiring** — reads today's sales + order count via `repos.sales.listSalesByBranch()`; drops "Active Sessions" (no backing concept).

## Accessibility

- `RouteError` with `role="alert" aria-live="polite"` for system errors only
- `OfflineBanner` with `role="status" aria-live="polite"` — uses text label "● Offline", not color alone
- `SkeletonRows` wrapped in `aria-hidden="true"` (per existing Skeleton component)
- All new interactive elements use `--accent` focus-ring convention

## Testing Checklist

- [ ] Storybook: `RouteError`, `OfflineBanner`, `SkeletonRows` stories render without error
- [ ] Dashboard: fresh DB shows correct "No sales yet" empty state; real sales display with totals
- [ ] Login offline: OfflineBanner appears; form still submits (offline sign-in path exists)
- [ ] Checkout offline: OfflineBanner + pending count visible; finalize-sale succeeds
- [ ] E2E offline walkthrough: DevTools offline → register stays functional → RouteError not thrown
- [ ] Error mapping: forced storage quota error shows plain-language message, not raw error
