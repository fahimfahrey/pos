# Device Matrix

The register (`docs/design-direction-pos.md`) and back-office (`docs/design-direction.md`) docs each
describe *one* device in detail — the iPad-class tablet at the counter, and the desktop dashboard viewer.
This doc is the connective layer: it enumerates every physical device this product actually ships to,
assigns each a breakpoint + input model, and states the concrete rules (orientation, safe area, on-screen
keyboard, minimum viewport) that make the two screens above hold up on all four.

## The four devices

| # | Device | Role | Viewport (CSS px) | Input | Orientation | Primary screens |
|---|--------|------|--------------------|-------|-------------|------------------|
| 1 | Tablet at the register | Cashier, primary POS | 1024×768 (iPad landscape) | Touch (coarse pointer, no hover) | Landscape, locked | `/pos/checkout` — touch-optimized (56px targets, §3 of design-direction-pos.md) |
| 2 | Desktop terminal | Cashier or manager, keyboard-first register | 1280×800+ | Keyboard + mouse (fine pointer, hover) | Landscape only (desktop OS) | `/pos/checkout` — keyboard-optimized (shortcuts already wired: F2 Pay, F3 Hold, F6 Void, Tab flow through payment sheet); denser controls, hover states |
| 3 | Small all-in-one POS | Compact counter terminal (e.g. 7–8": Clover Mini/Station-class hardware) | 1024×600 down to 800×480 | Touch, short viewport | Landscape, very limited vertical room | `/pos/checkout` — same touch layout as #1, vertically compacted |
| 4 | Phone | Manager glancing at numbers on the floor | 390×844 (iPhone-class) portrait, 844×390 rotated | Touch | Portrait primary, rotation allowed | Back office (`/app`, `/app/reports`) usable; `/pos/checkout` must not break if opened |

Tasks 2 (register) and 1/10 (back office) already own the *content* of devices #1/#2 and #2/#4 respectively.
This doc's job is the breakpoint plumbing and the cross-cutting device concerns (orientation, safe area,
keyboard) that apply underneath all of them.

## Breakpoints

Tailwind's default width breakpoints are used unchanged — no new width breakpoint was needed because the
tablet (#1), small POS (#3), and desktop (#2) all sit at or above `lg` (1024px), and the phone (#4) sits
below `sm` (640px):

| Tailwind breakpoint | Width | Maps to |
|---|---|---|
| *(base, no prefix)* | 0–639px | Phone (#4) |
| `sm` | ≥640px | Phone landscape / small tablets |
| `md` | ≥768px | — (unused gap between phone and register hardware) |
| `lg` | ≥1024px | Tablet (#1) and small POS (#3) width floor — this is why `design-direction-pos.md:40` calls out `lg` as "the codebase's tablet minimum" |
| `xl` | ≥1280px | Desktop (#2) |

Width alone can't tell #1 (1024×768) apart from #3 (1024×600–1024×480): both land in `lg`. The
distinguishing dimension is **height**, which Tailwind doesn't expose by default, so two custom variants
were added in `src/app/globals.css`:

```css
@custom-variant short (@media (max-height: 700px));
@custom-variant mouse (@media (hover: hover) and (pointer: fine));
```

| Variant | Fires on | Used for |
|---|---|---|
| `short:` | Any viewport ≤700px tall — small POS (#3, 480–600px tall) and phones in landscape | Compacting the register header, running-total block, and cart rows so the layout still fits without scrolling per the density budget in `design-direction-pos.md` §2 |
| `mouse:` | Fine pointer **and** hover support — i.e. an actual mouse (desktop #2), never a touchscreen even in landscape at desktop width | Shrinking hit targets below the 56px touch floor and enabling hover states, without touching the 56px targets tablet/small-POS/phone rely on for thumbs |

Base (unprefixed) styles are the touch/tablet baseline; `short:` and `mouse:` layer compaction/desktop
treatment on top. This keeps one component tree instead of forking the register into separate touch and
keyboard components.

## Orientation

- **Tablet (#1) and small POS (#3):** landscape-only in practice (counter-mounted hardware). No portrait
  layout is built for the register; if a tablet is rotated to portrait it keeps the same DOM but will look
  cramped — acceptable because the hardware is physically mounted and won't rotate.
- **Desktop (#2):** landscape only (no orientation concept).
- **Phone (#4):** portrait is primary for the back office. Rotating to landscape re-triggers `short:`
  compaction (the phone becomes ≤700px tall) so back-office headers and report chart frames compact the
  same way the small POS does — one rule serves both "short landscape" cases instead of a phone-specific
  branch.

## Safe area (notches, home indicators, rounded corners)

`src/app/layout.tsx`'s `viewport` export sets `viewportFit: 'cover'`, which lets the page draw under the
notch/home-indicator on iOS and populates the `env(safe-area-inset-*)` constants (they resolve to `0` on
hardware without a cutout, so this is a no-op on tablets/desktop/small-POS).

Applied at:
- `RegisterHeader` — `pt-[env(safe-area-inset-top)]` (top notch)
- Register bottom action bar (Hold/Void/Pay) — `pb-[max(1rem,env(safe-area-inset-bottom))]` (home indicator)
- Checkout root — `pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]` (landscape notch on phones)
- `AppShell` header — same top inset, for the back office on phone

## On-screen keyboard not covering inputs

Two changes, both because mobile browsers resize the *visual* viewport (not the layout viewport) when the
keyboard opens, and `100vh`/`h-full` chains anchored to the layout viewport don't shrink to match:

1. `checkout/layout.tsx`'s root and the `Sheet` primitive's fixed panels (`sheet.tsx`) use `h-dvh` instead
   of `h-full`/`100vh`, so the register and any open sheet track the dynamic (keyboard-aware) viewport.
2. The payment sheet (`PaymentSheet`) already opens as a scrollable `overflow-y-auto` panel rather than a
   fixed-height form, so when the keyboard covers part of it the tendered-amount input scrolls into view
   instead of being trapped beneath the keyboard. Numeric inputs use `inputMode="decimal"` to get the
   number-only keyboard variant (no keyboard layout switch mid-entry).

## Very small POS displays

The `short:` variant (≤700px tall) compacts, in order of priority (matches the density budget in
`design-direction-pos.md` §2 — header, then total, then rows, never the Pay button below 44px):

- `RegisterHeader`: `min-h-14` → `min-h-10`
- `RunningTotal`: `py-5` → `py-2`, total numerals `text-6xl` → `text-3xl`
- `CartRow`: `min-h-16` → `min-h-12`
- `QtyStepper` buttons: `10×10` → `8×8` (still ≥24px WCAG 2.5.5 minimum-with-spacing floor)
- Register bottom bar keeps `h-14`/56px — Pay/Hold/Void never shrink below the touch-target floor, even on
  the shortest hardware.

## Testing

Playwright (`playwright.config.ts`) runs four device-emulation projects — `tablet`, `desktop`, `small-pos`,
`phone` — against Storybook stories for the two screens named in the acceptance criteria:

- `RegisterLayout` (`src/app/pos/checkout/_components/register-layout.stories.tsx`)
- `ReportsView`, one report (`src/app/(dashboard)/app/reports/reports-view.stories.tsx`)

Stories are used instead of the live routes because `/pos/checkout` and `/app/reports` currently require a
signed-in session **and** client-side (IndexedDB) onboarding state — and the onboarding wizard has a known
bug (`ownerUserId: 'current-user-id'` placeholder in `onboarding-wizard.tsx`, tracked separately) that
prevents a scripted sign-up → onboarding → checkout flow from reaching a stable "ready" state today.
Rendering the same components from Storybook with mocked props gives real device-emulation + visual
snapshots of the actual production layout code without depending on that unrelated, pre-existing gap.
`e2e/device-matrix.spec.ts` takes a `toHaveScreenshot()` snapshot of each story on each project (8 snapshots
total). Once the onboarding bug above is fixed, these can be pointed at the live routes with a seeded
session instead.
