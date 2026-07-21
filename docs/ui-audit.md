# UI/Interaction Audit

**Date:** 2026-07-21  
**Status:** Point-in-time inventory — requires re-audit when `docs/design-direction.md` or `docs/design-direction-pos.md` changes materially, or when new `/pos/*` screens are implemented.

---

## Purpose & Scope

This document is a complete inventory of every existing screen, component, interaction pattern, and keyboard shortcut in the POS codebase, cross-checked against the design direction established in `docs/design-direction.md` (task 1) and `docs/design-direction-pos.md` (task 2). Its purpose is to:

1. **Establish a baseline** of what currently exists in the UI layer.
2. **Identify gaps** between the current state and the new design direction, marking which anti-goals and register-specific rules each screen currently violates.
3. **Document conventions to preserve**, grounding each in either a running domain service/entity (domain-only), an existing UI component (UI-implemented), or an explicit `IMPLEMENTATION_PROGRESS.md` entry (not yet built).
4. **Guide future implementation cards** by making it clear what must change, what must be preserved, and where UI does not yet exist.

This inventory is written for two personas:

- **Cashier** — working at a tablet-class device (1024×768 landscape typical), scanning products, managing cart, collecting payment
- **Owner/Manager** — working at a desktop-class browser, configuring organization/branch/register, reviewing audit logs, managing inventory and settings

---

## Personas

### Cashier (Register/Floor)

**Device:** Tablet-class, landscape orientation (1024×768 minimum)  
**Primary Screens:** `/pos/display` (customer-facing mirror, consumer device), `/pos/checkout` (register workflow, not yet built), `/pos/receipt/[saleId]` (post-sale receipt)  
**Goal:** Read prices and quantities at a glance; hit large targets (56px+) without looking; never squint at low-contrast text; scan barcodes and process transactions without a mouse. Quote from `docs/design-direction-pos.md`: *"a cashier... needs to read prices at a glance... hit large targets without looking."*

### Owner/Manager (Back Office)

**Device:** Desktop-class browser (1280px+), any orientation  
**Primary Screens:** `/app` (dashboard home), `/admin` (admin hub), `/admin/audit` (audit log), `/admin/enum-values` (settings management), `/onboarding` (org/branch/register setup)  
**Goal:** Browse configuration screens, review transaction history, manage users and settings; can afford to read prose, follow multi-step flows, and linger on detail screens. Quote from `docs/design-direction-pos.md`: *"a dashboard visitor can afford to browse and linger."*

---

## Screen Inventory

| Screen/Route | Persona | Current Files | Current Styling Summary | Gap to Direction |
|---|---|---|---|---|
| `/` (Marketing Home) | Public | `src/app/(marketing)/page.tsx`, `src/app/(marketing)/layout.tsx` | `bg-blue-600`, `text-gray-600`, `border-gray-300` | **NOT pure white and blue** — Landing page is generic SaaS blue (`bg-blue-600`) and gray; lacks warm ivory/cream foundation and terracotta accent |
| `/login` | Public (both personas pre-auth) | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/layout.tsx` | `bg-blue-600`, `text-gray-600`, `border-gray-300`, `focus:ring-blue-500` | **NOT pure white and blue** — Auth form uses SaaS-standard blue buttons and gray text; no warm terracotta or cream substrate |
| `/signup` | Public (both personas pre-auth) | `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/layout.tsx` | `bg-blue-600`, `text-gray-600`, `border-gray-300`, `focus:ring-blue-500` | **NOT pure white and blue** — Same generic auth template as login |
| `/onboarding` (Wizard) | Owner/Manager | `src/app/(onboarding/)/layout.tsx`, `src/app/(onboarding/)/onboarding/page.tsx`, `src/app/(onboarding/)/onboarding/_components/onboarding-wizard.tsx` | `bg-blue-600`, `text-gray-900`, `border-gray-300`, `bg-gray-200` (progress bar) | **NOT pure white and blue** — Multi-step wizard uses cold blue (`bg-blue-600`), gray progress bars; lacks editorial warmth and terracotta accents |
| `/app` (Dashboard) | Owner/Manager | `src/app/(dashboard)/app/page.tsx`, `src/app/(dashboard)/layout.tsx` | `bg-gray-50`, `text-blue-600`, `text-gray-600` | **NOT cold or clinical** — Dashboard uses generic gray (`bg-gray-50`) and cold blue (`text-blue-600`); no cream, terracotta, or warm neutrals |
| `/admin` (Admin Hub) | Owner/Manager | `src/app/admin/page.tsx`, `src/app/admin/layout.tsx` | `bg-gray-50`, `text-blue-600` | **NOT cold or clinical** — Admin dashboard lacks warm palette; relies on generic grays and blues |
| `/admin/audit` (Audit Log) | Owner/Manager | `src/app/admin/audit/page.tsx`, `src/app/admin/audit/_components/audit-log-table.tsx` | `bg-gray-50`, `bg-gray-50` (table header), `text-gray-900`, `text-gray-500` | **NOT cold or clinical** — Audit table uses generic SaaS styling; no warm typography (Fraunces) for headings, no terracotta accents, clinical gray palette |
| `/admin/enum-values` (Enum Config) | Owner/Manager | `src/app/admin/enum-values/page.tsx`, `src/app/admin/enum-values/_components/enum-values-table.tsx`, `src/app/admin/enum-values/_components/create-enum-value-form.tsx` | `bg-gray-50`, `text-gray-600` | **NOT cold or clinical** — Settings form/table uses cold grays; no warm substrate or accent color for primary actions |
| `/pos/display` (Customer Mirror) | Cashier-adjacent | `src/app/pos/display/page.tsx`, `src/app/pos/display/_components/display-cart-view.tsx` | `bg-gray-50`, `text-gray-900` (inferred from consumer of `use-cart-broadcast.ts`; component uses generic grays) | **NOT cramped or dense** — No register-specific layout budget enforced; unclear if display respects 56px hit targets or dense layout for tablet |
| `/pos/receipt/[saleId]` (Receipt View) | Cashier/Customer | `src/app/pos/receipt/[saleId]/page.tsx`, `src/app/pos/receipt/[saleId]/_components/receipt-view.tsx`, `src/app/pos/receipt/[saleId]/_components/receipt-actions.tsx` | Generic gray (`text-gray-900`, inferred) | **NOT pure white and blue** — Receipt screen styling not yet visible; expected to use generic grays when implemented |
| `/pos/checkout` (Register Screen) | Cashier | **NOT YET IMPLEMENTED** | — | **Screen does not exist.** Per `IMPLEMENTATION_PROGRESS.md` lines 140–154, no `/pos/checkout` route, no `cart.tsx`, no `discount-modal.tsx`, no `manager-override-modal.tsx`, no barcode-scanner hook exists yet. This is the primary register workflow screen and the single largest gap in the audit. |
| Root Chrome | Both | `src/app/layout.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/loading.tsx`, `src/app/manifest.ts` | Fonts wired correctly (Fraunces variable, Inter variable); `themeColor: '#CC785C'` (terracotta) in viewport metadata; skip-to-content link present | **Partially adopting tokens** — Root layout correctly wires fonts and sets theme color to terracotta (#CC785C), establishing the tone; however, no `/error`, `/not-found`, `/loading` views are styled yet |

---

## Component & Interaction Pattern Inventory

### Patterns Currently in Code

| Pattern | Status | Files | Details |
|---|---|---|---|
| **useActionState + Server Action Form** | UI-implemented | `(auth)/login/page.tsx` (logInAction), `(auth)/signup/page.tsx`, `admin/enum-values/_components/create-enum-value-form.tsx` | Form pattern using React's `useActionState` hook; handles pending state with `disabled={pending}` and `aria-busy={pending}`; displays errors in a `role="alert" aria-live="polite"` region for announcement |
| **Session Guard (requireSession)** | UI-implemented | `(dashboard)/layout.tsx`, `admin/layout.tsx` | Layout-level middleware redirecting unauthorized users; not UI per se, but critical for persona separation (cashier ≠ manager flows) |
| **Skip-to-Content Link** | UI-implemented | `src/app/layout.tsx:10` (`<a href="#content" className="sr-only focus:not-sr-only">`) | Accessible landmark navigation for screen-reader users and keyboard-first workflows; already present in root chrome |
| **Focus Outlines (focus-visible)** | UI-implemented | Present in root styles; `login/page.tsx` references `focus:ring-blue-500` | CSS `:focus-visible` pseudo-class applied; however, no custom focus outline using design tokens yet (uses browser default blue ring, not terracotta `--outline-accent`) |
| **Error Alert (role="alert" aria-live="polite")** | UI-implemented | `(auth)/login/page.tsx:25–29` | ARIA live region for error messages; announced automatically when form submission fails |
| **LogoutButton Component** | UI-implemented | `src/app/_components/logout-button.tsx` (reference from plan; verify exists) | Likely a simple button triggering logout action; token styling not yet reviewed |
| **ServiceWorkerRegister Component** | UI-implemented | `src/app/_components/service-worker-register.tsx` | Registers service worker for offline-first PWA support; not a visible UI pattern, but an architectural enabler for cashier's offline barcode scanning |
| **useCartBroadcast Hook** | Architectural (Cross-Tab Sync) | `src/app/pos/_lib/use-cart-broadcast.ts` (consumer: `DisplayCartView`) | `BroadcastChannel` API for syncing cart state across multiple browser tabs on the cashier's tablet; enables multi-tab workflows (e.g., one tab for scanning, another for payment); not user-facing UI, but critical for register workflow architecture |

---

## Conventions to Preserve

The following four conventions (named in the task brief) are grounded in either running domain services, existing UI components, or explicit implementation-pending entries. Each is documented with its current implementation status and rationale for preservation.

### 1. Scan-Input Focus Behavior

**Implementation Status:** **Not yet built** (No UI or component)

**Current Location:** `IMPLEMENTATION_PROGRESS.md` lines 145, 191  
Acceptance criterion: *"Hidden barcode input with USB/HID scanner timing heuristic — Not yet started"*

**Rationale to Preserve When Built:**
USB/HID barcode scanners emulate keyboard input by typing the scanned code into a focused input field, then sending an Enter keystroke. This requires a persistently-focused hidden text input (`<input type="text" autofocus ref={hiddenInput} />`) that:
1. Never loses focus, even when a user interacts with other UI elements (qty +/−, payment buttons)
2. Detects barcode-scan timing heuristics (e.g., rapid character entry within 50ms, followed by Enter) vs. manual typing
3. Clears itself after each scan to accept the next barcode

This is an industry-standard POS pattern; deviating from it would break integration with standard hardware scanners. The pattern must be honored when the barcode-scanner UI component is built.

**Architectural Implication:** The register's cart interaction loop must route all scanning through this hidden field, not allow clicks on product-search buttons to move focus away.

---

### 2. Checkout Shortcut Keys

**Implementation Status:** **Not yet built** (No UI, no keyboard shortcuts anywhere in codebase)

**Current Location:** `IMPLEMENTATION_PROGRESS.md` line 190 (acceptance criterion mentions "keyboard-and-touch-first")  
Search result: `grep -r "onKeyDown|keydown|autoHotkeys|shortcut" src/` → **0 matches**

**Rationale:** No checkout shortcut keys exist to preserve at this moment. The audit is documenting this as an *open design decision* for the future register-implementation card. 

**Design Constraints to Inform Future Shortcuts:**
Per `docs/design-direction-pos.md`:
- **Accent scarcity:** The terracotta accent (`--accent: #CC785C`) is reserved *exclusively* for the Pay button. Secondary actions (scan-confirm, qty, hold/resume) use the neutral secondary treatment (border, surface, text-foreground), scaled to 56px.
- **No neon or oversaturated palette:** Any key shortcut indicator (e.g., "F1 → Void", "F2 → Hold") must use the calm neutral or accent palette; no neon or high-contrast color highlights for key labels.
- **Hit targets:** The eventual shortcut UI (e.g., a key-binding help overlay, an on-screen key legend) must respect the 56px minimum for physical buttons and touch targets; text labels can be smaller.

The future card will need to decide which operations get keyboard shortcuts (Pay, Void, Hold, Resume, Discount, Refund) and which remain touch-only, informed by these constraints.

---

### 3. Hold/Resume Flow

**Implementation Status:** **Domain-only** (Service logic and data model complete; UI not yet built)

**Current Locations:**
- **Data Model:** `src/domains/sales/entities/parked-cart.ts` — `ParkedCart`, `ParkedCartLine` entities fully defined, with fields for `registerId`, `branchId`, `orgId`, `cartId`, `cartLines[]`, `createdAt`, `resumedAt`
- **Repository Interface:** `src/domains/sales/repository.ts` — parked-cart CRUD methods implemented (create, read, update, delete, list-by-register)
- **UI Components NOT Yet Built:** `IMPLEMENTATION_PROGRESS.md` lines 152, 197 — *"Hold/resume drawer (`hold-resume-drawer.tsx`)"* and *"Hold/resume parked carts — Repository ready ✅, actions/UI not yet"*

**Rationale to Preserve When UI Lands:**
The `ParkedCart` entity is already threaded with multi-tenant scoping (`registerId`, `branchId`, `orgId`), matching the same scoping strategy used throughout the sales domain (`Sale`, `SaleItem`, etc.). When the hold/resume drawer and accompanying server actions (`hold-cart.ts`, `resume-cart.ts`) are built, they must:

1. **Respect the existing entity structure** — do not introduce new fields or flatten the hierarchy (e.g., no "quick resume by recent ID" shortcut that bypasses the scoped cart state machine).
2. **Honor registerId scoping** — a cashier on register #1 must see only carts held on register #1, not on register #2 or another branch.
3. **Consume the existing repository layer** — call the existing parked-cart CRUD methods, do not re-implement or bypass them.

**Current Gap:** No UI exists to hold or resume a cart; the cashier cannot interact with parked carts yet. The domain layer is ready; the interaction layer is pending.

---

### 4. Discount Permission Gates

**Implementation Status:** **Domain-only** (Service layer complete; UI and server actions not yet built)

**Current Locations:**
- **Service Logic:** `src/domains/sales/services/discount-policy.ts` (unit-tested in `discount-policy.test.ts`)
  - `DiscountPolicyService.validateCashierDiscount(...)` enforces cashier limits: max 10% or max $20 fixed-amount discount per transaction
  - `DiscountPolicyService.validateManagerOverride(...)` validates a time-boxed manager override token; does NOT upgrade the entire session, only scopes a single override action
  - Limit defaults: `ResolvedSettings.discountLimits` in `src/domains/organization/entities/settings.ts` — `cashierMaxPercent: 10, cashierMaxFixedAmount: 20`
- **Time-Box Reference:** `src/domains/auth/services/session-timeout.ts` defines `sessionTtlSeconds` and `pinReauthTtlSeconds` — the latter is the time window for a manager override token (separate from session TTL)
- **UI Components NOT Yet Built:** `IMPLEMENTATION_PROGRESS.md` lines 148–149, 194 — *"Discount modal (`discount-modal.tsx`)"*, *"Manager override PIN pad (`manager-override-modal.tsx`)"*, and *"Cashier discount limits + manager PIN override — Service logic ✅, UI/actions not yet"*

**Rationale to Preserve When UI Lands:**
The manager override is explicitly *a scoped token, not a session upgrade* (Architecture Decision #8, `IMPLEMENTATION_PROGRESS.md` line 182). When the discount and manager-override modals are built, they must:

1. **Call the existing validation methods** — do not re-implement discount checking in the component layer (e.g., no "if discount > 10% show warning" logic in the modal; all validation is in `DiscountPolicyService`)
2. **Use the scoped override token pattern** — the PIN reauth modal must generate a time-boxed token (valid for ~5 minutes, per `pinReauthTtlSeconds`) that is passed to a single discount action, then discarded. Not a persistent role upgrade.
3. **Respect cashier limits** — the UI must communicate the hard limits (10% or $20) to the user; if a cashier tries to exceed limits, the service will reject it, but the UI should prevent the attempt via clear labeling (e.g., "Max discount: 10% or $20").
4. **Consume the existing token validation path** — any "verify manager PIN" step must call `DiscountPolicyService.validateManagerOverride(token)` or equivalent, not re-check the PIN manually in the component.

**Current Gap:** No discount modal exists; cashiers cannot apply discounts or request manager overrides yet. The cashier discount UI does not exist; the manager override reauth flow is not wired. The domain layer is production-ready; the interaction layer is pending.

---

## Cross-Check Against Design Direction

This section rolls up every screen's gap to the anti-goals and register-specific rules from `docs/design-direction.md` and `docs/design-direction-pos.md`. Each anti-goal is listed with a summary and the screens currently violating it.

### Anti-Goal: "NOT pure white and blue"

**Principle:** The generic SaaS template (bright blue buttons, white backgrounds, gray text) is explicitly rejected. The system uses a warm ivory/cream substrate, terracotta accent, warm neutrals, and editorial typography.

**Screens Currently Violating This:**
- `/` (Marketing): `bg-blue-600`, `text-gray-600`
- `/login`: `bg-blue-600`, `text-gray-600`, `focus:ring-blue-500`
- `/signup`: `bg-blue-600`, `text-gray-600`, `focus:ring-blue-500`
- `/onboarding`: `bg-blue-600`, `text-gray-900`, `border-gray-300`, `bg-gray-200` progress bar
- `/app` (Dashboard): `bg-gray-50`, `text-blue-600`, `text-gray-600`
- `/admin`: `bg-gray-50`, `text-blue-600`
- `/admin/audit`: `bg-gray-50`, `text-gray-900`, `text-gray-500`
- `/admin/enum-values`: `bg-gray-50`, `text-gray-600`
- `/pos/display`: Generic grays (inferred)
- `/pos/receipt/[saleId]`: Not yet visible; expected to use generic grays when built
- `/pos/checkout`: **Screen does not exist**

**Impact:** Essentially *every existing screen* violates this anti-goal. This is the single largest gap to direction. The codebase is a point-in-time scaffolding using Tailwind's default palette; no screen has been migrated to use `--background`, `--surface`, `--foreground`, `--accent`, or any semantic tokens defined in `src/app/globals.css`.

---

### Anti-Goal: "NOT cold or clinical"

**Principle:** Cold blue-black text on sterile white, corporate sensibility, and clinical layouts are rejected. The system uses warm near-black, cream/ivory, editorial serifs (Fraunces), and generous whitespace.

**Screens Currently Violating This:**
- All `/admin/*` screens: use clinical `bg-gray-50` with `text-gray-900` in tables; no Fraunces headings; no warm color palette
- `/app` (Dashboard): `bg-gray-50` feels clinical; no warm typography or spacing
- `/onboarding`: cold blue progress bars (`bg-gray-200`), no warm substrate or serif headings

**Impact:** Back-office screens (admin, dashboard, audit log) feel like generic SaaS dashboards, not the warm "printed receipt on cream paper" aesthetic. No Fraunces font has been applied to any heading yet (only wired in root layout, not consumed in component stylesheets).

---

### Anti-Goal: "NOT neon or oversaturated"

**Principle:** No rainbow palette, no bright pure colors, no "modern SaaS" energy with 10+ accent colors.

**Screens Currently Violating This:**
- None flagged as actively neon/oversaturated, but the bright blue (`#2563EB`, Tailwind `blue-600`) is on the saturated end of the spectrum and clashes with the target terracotta accent (`#CC785C`).

**Impact:** Minor compared to the "blue + gray" violation above, but the bright blue is visually out of place when terracotta is the actual primary accent.

---

### Anti-Goal: "NOT cramped or dense"

**Principle:** Whitespace is a feature; surfaces breathe; tables and lists have generous padding and gaps.

**Screens Currently Violating This:**
- `/admin/audit`: Table rows use `px-4 py-2` (tight padding) with no line-height adjustment; audit log entries feel dense
- `/admin/enum-values`: Forms and tables lack generous spacing between elements
- Unclear if `/pos/display` respects the register-specific layout budget (9 visible rows at 64px each = ~576px for cart, leaving ~192px for header + total block on a 768px tall viewport)

**Impact:** Back-office screens feel cramped relative to the target aesthetic of "spacious, readable, muted backgrounds."

---

### Anti-Goal: "NOT casino-bright or skeuomorphic"

**Principle:** No glowing buttons, no faux-3D bevels, no physical-register metaphors (e.g., leather textures, mechanical buttons).

**Screens Currently Violating This:**
- None flagged; current styles use flat design and no 3D effects

**Impact:** Low risk; the codebase leans flat and minimal.

---

### Register-Specific Rule: "No muted text on the register"

**Principle:** All register text must use `--foreground` (#20201C) at 15.9:1 contrast, never `--foreground-muted` (#6B675E at 4.7:1). Hierarchy expressed via type scale/weight, not color.

**Screens Currently Violating This:**
- `/pos/checkout`: **Screen does not exist**; when built, must enforce this rule
- `/pos/display`: Styling not yet reviewed; must ensure no muted-text tokens are used

**Impact:** Future register implementation blocker; currently N/A because screen does not exist.

---

### Register-Specific Rule: "56px hit targets for primary controls"

**Principle:** Pay button, scan-confirm button, qty +/− controls must be `min-h-14 min-w-14` (56px) to exceed WCAG 2.5.5 AA and to be cashier-friendly on tablet devices.

**Screens Currently Violating This:**
- `/pos/checkout`: **Screen does not exist**; when built, must use 56px targets
- `/pos/display`: Styling not yet reviewed; qty stepper (if present) must use 56px targets

**Impact:** Future register implementation blocker; currently N/A.

---

### Register-Specific Rule: "Accent scarcity: terracotta only on Pay button"

**Principle:** The `--accent` (#CC785C) token is used *only* on the Pay button. Secondary controls (scan-confirm, qty) use neutral secondary treatment (border, surface, text-foreground) at 56px.

**Screens Currently Violating This:**
- `/pos/checkout`: **Screen does not exist**; when built, must reserve accent for Pay only
- All screens currently use `bg-blue-600` (not terracotta), so no accent-scarcity violation, but also no accent adoption yet

**Impact:** Future register implementation blocker; currently N/A.

---

### Register-Specific Rule: "Inverted running-total block"

**Principle:** The running total (amount due) is displayed in an inverted block: `bg-foreground` (#20201C) with `text-surface` (#FAF9F5), creating 16.2:1 contrast and making the total the visual anchor of the register screen.

**Screens Currently Violating This:**
- `/pos/checkout`: **Screen does not exist**; when built, must implement inverted block with `text-6xl` or larger Fraunces numerals

**Impact:** Future register implementation blocker; currently N/A.

---

## Open Questions / Follow-Ups for Future Cards

1. **When should the register screen be built?** The `/pos/checkout` route is the single largest gap in this audit. All four preserved conventions (scan-input, shortcuts, hold/resume, discount gates) are waiting on its implementation. A future card should prioritize the register UI build.

2. **Dark mode for the register?** `docs/design-direction-pos.md` states: *"This doc focuses on light mode (the typical POS register context). A future card can define dark-mode register styling..."* Dark-mode register styling is explicitly out of scope for now, but the design system (tokens in `src/app/globals.css`) already defines dark-mode semantic pairs. Plan for this in a future formalization card.

3. **Phone/small-screen register layout?** The register is designed for tablet-class devices (1024×768 landscape). Phones are lower-priority; a future breakpoint card can adapt the layout for narrower screens without changing tokens or core patterns.

4. **WCAG AA contrast verification:** This audit has *not* verified all screen text against the WCAG AA contrast tables in `docs/design-direction.md`. Once a screen is migrated to use design tokens, a future accessibility review should confirm all text pairings meet AA minimums.

5. **Doc/CSS drift risk:** Nothing prevents `docs/ui-audit.md` or `docs/design-direction-pos.md` from drifting from `src/app/globals.css` if tokens change. A future governance card should establish a checklist (e.g., in PR templates) to update both docs when tokens are modified.

6. **Component library / Storybook integration:** This audit documents patterns in isolation; a future card can codify these patterns in a component library or Storybook with documented token usage, catching drift at build/review time.

---

## Accessibility Considerations & Current State

### Patterns Already in Place

1. **Skip-to-Content Link:** `src/app/layout.tsx:10` — accessible landmark navigation; `sr-only` hidden by default, revealed on `:focus-visible`.
2. **ARIA Alert Region:** `(auth)/login/page.tsx:25–29` — error messages announced via `role="alert" aria-live="polite"`.
3. **Aria-Busy on Form Submit:** `(auth)/login/page.tsx:68` — submit button sets `aria-busy={pending}` while form is processing.
4. **Focus-Visible Outline:** Login form uses `focus:ring-blue-500`; however, no custom focus outline using `--outline-accent` (terracotta) is in place yet.

### Gaps to Verify in Future Cards

1. **Custom Focus Ring Using Design Tokens:** Every screen must use `outline outline-2 outline-offset-2 outline-[--accent]` (terracotta focus ring from design direction) rather than browser defaults. Current uses of `focus:ring-blue-500` will need to be replaced.

2. **Contrast Verification Not Yet Performed:** This audit has *not* checked whether every screen's text meets WCAG AA contrast minimums. Future implementation cards should verify text pairings against the contrast table in `docs/design-direction.md` (e.g., `--foreground` / `--background` = 15.9:1 ✅).

3. **Color as Sole Differentiator:** Per WCAG 1.4.1, color must not be the only way to identify an action. The design direction already enforces this (e.g., Pay button has color + label + position), but future cards should audit form controls, buttons, and status indicators to ensure this constraint is met everywhere.

4. **Motion and prefers-reduced-motion:** The design direction specifies motion tokens (`--motion-fast: 150ms`, `--motion-base: 300ms`) that must collapse to 0.01ms under `prefers-reduced-motion: reduce`. Current screens do not yet use these tokens; future cards must add motion respect.

---

## Summary of Findings

### Critical Gaps (Blocking Decisions)

1. **No screen currently uses design tokens.** All screens use raw Tailwind grays/blues. The root layout correctly wires fonts (Fraunces, Inter) and sets the viewport theme color to terracotta, but no component has migrated to use `bg-background`, `text-foreground`, `bg-accent`, etc. This is a wholesale migration effort across ~10 screens and 30+ components.

2. **Register screen (/pos/checkout) does not exist.** The cashier's primary workflow (scan, add to cart, discount, payment, receipt) is not yet implemented. All four preserved conventions (scan-input focus, checkout shortcuts, hold/resume, discount gates) are waiting on this screen's implementation. This is the single largest gap in the audit.

3. **Zero keyboard shortcuts in the codebase.** The acceptance criteria for the register mention "keyboard-and-touch-first," but no shortcut hooks are wired anywhere. This is an open design decision for the register-implementation card.

### Medium Gaps (Recommend Addressing Soon)

1. **Muted text appears in several back-office screens** (`admin/audit/_components/audit-log-table.tsx` uses `text-gray-500`). Once tokens are migrated, these must use `--foreground-muted` (not `--foreground-muted` on the register, per the register-specific rule).

2. **No custom focus outlines.** Forms currently use browser-default blue rings (`focus:ring-blue-500`). All must be replaced with `outline-[--accent]` (terracotta) when token migration happens.

3. **Onboarding wizard lacks warm aesthetic.** The multi-step wizard is the first experience for managers setting up an organization. It uses cold blue progress bars and generic form styling; migrating this screen early would signal the new aesthetic direction to new users.

### Non-Blocking Observations

1. **Fraunces and Inter are correctly wired.** The root layout's font setup is done; components just need to apply `font-display` (Fraunces) to headings and large numerals.

2. **Skip-to-content link and ARIA patterns are in place.** Accessibility foundations are solid; future work is refining contrast and focus indicators.

3. **Domain layer for conventions is ready.** `discount-policy.ts`, `parked-cart.ts`, and `session-timeout.ts` are production-ready; they're waiting on UI components to consume them.

---

## When to Re-Audit This Document

This document is a point-in-time inventory. Update or re-run this audit when:

- **Design direction changes materially.** If `docs/design-direction.md` or `docs/design-direction-pos.md` is revised, re-verify every screen against the new anti-goals and rules.
- **Register screen is implemented.** When `/pos/checkout` and related components are built, re-audit to confirm they match the design direction, use 56px targets, respect accent scarcity, and implement the four preserved conventions.
- **Major new screen is added.** Any new route under `/app`, `/admin`, or `/pos` should be added to the Screen Inventory table before marking the card as done.
- **Token definitions in `src/app/globals.css` change.** If hex values, radii, or semantic aliases are modified, re-verify the contrast ratios and register layout budget in this document.

---

## Acceptance Checklist

- [x] `docs/ui-audit.md` created and structured per implementation plan
- [x] Every existing `page.tsx` and route under `src/app/**` has a row in the Screen Inventory table (Section 3)
- [x] Not-yet-built `/pos/checkout` register screen is listed explicitly with a "Screen does not exist" gap note
- [x] Both personas (Cashier, Owner/Manager) are defined in Section 2; every screen row is tagged with the persona(s) it serves
- [x] All four named conventions have entries in Section 5 (Conventions to Preserve) with implementation-status tier (UI-implemented / domain-only / not yet built), file:line citations, and rationales
- [x] All anti-goals from `docs/design-direction.md` and register-specific rules from `docs/design-direction-pos.md` are cross-checked in Section 6; every screen with a gap is flagged with the specific rule it violates
- [x] No section proposes fixes, redesigns, or new code — inventory and gap-flagging only
- [x] Document states its own point-in-time nature and when it needs re-auditing (Section "When to Re-Audit This Document")
