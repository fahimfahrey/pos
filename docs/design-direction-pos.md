# Design Direction: POS Checkout Register

## Purpose & Relationship to the Base Direction

This document is a *register* (in the typographic sense: a different mode or tone) of [`docs/design-direction.md`](./design-direction.md)'s language for the checkout/POS register screen. It is not a fork or a separate design system — it is the same product, the same palette, the same typefaces — adapted for a different context: a cashier working a tablet at a counter needs to read prices at a glance, hit large targets without looking, and never squint at low-contrast text, whereas a dashboard visitor can afford to browse and linger. A reviewer looking at both screens side by side should immediately recognize them as the same system.

---

## What Carries Over Unchanged

The register inherits these commitments from the base direction without modification:

- **Palette hue family:** warm ivory/cream substrate, terracotta accent, brick red for destruction, amber for warning, sage for success — no new hues introduced, no cold blues or neons.
- **Typography:** Fraunces for display/numerals (editorial, warm, never cold), Inter for body/UI (humanist sans, broad Unicode support).
- **Font licensing:** SIL OFL 1.1 (free to use, both fonts).
- **Corner radii:** `--radius-button: 10px`, `--radius-card: 10px`, `--radius-input: 6px` — unchanged even though targets grow larger.
- **Motion doctrine:** `--motion-fast: 150ms`, `--motion-base: 300ms`, easing `cubic-bezier(0.4, 0, 0.2, 1)` — smooth and confirming, never bouncy; all transitions respect `prefers-reduced-motion: reduce`.
- **Anti-goals:** not cold or clinical, not neon or oversaturated, not cramped, not casino-bright or skeuomorphic, not a design system for its own sake — every decision serves legibility or human warmth.

---

## What Bends for the Register

### 1. Contrast Floor: No Muted Text on the Register

**Rule:** All register text — cart line items, unit prices, quantity, tax line, running total — uses `--foreground` (#20201C) at 15.9:1 on `--background` (#F5F4EF) or 16.2:1 on `--surface` (#FAF9F5). The token `--foreground-muted` (#6B675E, 4.7:1) is **retired entirely from the register** and not used anywhere on this screen.

**Number:** 15.9:1 to 16.2:1 (full accessibility ceiling, AA-plus).

**Rationale:** The base doc's muted-text token is AA-compliant (4.7:1) but sits at the "calm, quiet" end of the accessible range — perfect for secondary labels on a dashboard. A cashier glancing at a register three times per second to read prices during a rush cannot afford a 4.7:1 pairing; every text element must be unmissable at a glance. All contrast ratios here are pulled from the base doc's existing Color System tables (no new hex values minted); the register simply *chooses* the darkest available foreground for every text element.

**Where muted visual hierarchy is needed** (e.g., a modifier note like "extra shot" underneath an espresso line item), express it via **type scale and weight** (smaller size, regular vs. semibold), never via a lighter color. This keeps the hierarchy clear without sacrificing legibility.

---

### 2. Density: Compact Layout Budget

**Rule:** The register layout is tightened from the base doc's generous dashboard spacing to fit a full cart view without scrolling on the floor viewport (iPad-class tablet, 1024×768 landscape).

**Number:** ~9 visible cart rows on the floor viewport (1024×768, common tablet minimum and the codebase's `lg` breakpoint).

**Layout Budget:**

| Element | Height | Notes |
|---------|--------|-------|
| Header / status bar | 56px | App header, order status, timestamp |
| Running total block | 96px | The single largest/highest-contrast element (see Density & Running Total below) |
| Outer padding (top + bottom) | 24px | Whitespace boundary |
| Cart list container | ~592px | Remaining vertical space |
| Cart row (each) | 64px | Qty control (56px min) + 4px padding top + 4px padding bottom |
| **Visible rows before scroll** | **~9** | Longer carts still scroll; this is a planning target, not a guarantee |

**Rationale:** "Fits without scrolling" is only verifiable with concrete numbers. A later implementation card may add virtualization if real usage patterns show 12+ item carts are common; for now, the target is density sufficient to hold a typical small order (salad, drink, dessert, tax) in one glance.

**Caveat:** This budget assumes real measured header chrome. If actual nav/order status consumes more height, the visible-row count shrinks — flag this for re-measurement during implementation.

---

### 3. Hit Targets: 56px for All Primary Controls

**Rule:** The Pay button, scan-confirm button, and quantity +/− controls are all sized to `min-h-14 min-w-14` (56px minimum height and width — exact Tailwind v4 scale match).

**Number:** 56px = 14 × 4px (Tailwind spacing unit).

**Rationale:** WCAG 2.5.5 (Target Size) requires 44×44px AA minimum or 24×24px with surrounding space; 56px comfortably exceeds AA by ~30% and is large enough for a cashier's thumb on a tablet without accidental mis-taps during a rush. Tailwind v4's default scale is 4px-based, so 56px lands exactly on the `size-14` step — implementers should use `min-h-14 min-w-14` or `size-14` (no arbitrary `h-[56px]` values).

---

### 4. Running Total: Inverted Block, the Single Highest-Contrast Element

**Rule:** The running total sits in an inverted block: `bg-foreground` (#20201C) with `text-surface` (#FAF9F5) or `text-background` (#F5F4EF), creating the inverse of the standard `foreground` + `background` pair. This is a 16.2:1 inverted contrast — the same ratio as the base doc's best pairing, just flipped in polarity.

**Number:** 16.2:1 inverted.

**Numbers (typography):** `font-display text-6xl` or larger (Fraunces, tabular-nums, full width, no muted label). Exactly how large depends on implementation (text-6xl ≈ 36px at base; text-7xl ≈ 42px), but the intent is unmissable dominance on screen.

**Rationale:** The register total is the *reason* the transaction exists; making it the only inverted (dark-on-light → light-on-dark) element on an otherwise cream/ivory page makes it the one mass that commands visual attention. A cashier scanning an order can always know where to look for the amount due: the dark block. The contrast ratio (16.2:1) is identical to the base doc's ceiling, just applied with reversed backgrounds — no new math, only a reversal of existing verified polarity.

---

### 5. Accent Scarcity: Coral Only for the Pay Button

**Rule:** The `--accent` (#CC785C) and `--accent-strong` (#B85A3F) tokens are reserved **exclusively for the Pay button**. Secondary controls (scan-confirm, qty +/−) use the base doc's existing secondary-button treatment: `border border-border`, `bg-surface`, `text-foreground`, scaled up to 56px.

**Number:** One accent-colored button (Pay); all other primary register controls are neutral/secondary style.

**Secondary button example:** `border border-border bg-surface text-foreground min-h-14 min-w-14 font-semibold rounded-[var(--radius-button)]`.

**Rationale:** The base doc is explicit about the coral accent being "restrained" and "a single restrained accent color" — it shows up on the dashboard's "Void Sale" button and on focus rings, and that's it. Introducing a second accent-weight color for "scan-confirm" or "confirm quantity" actions would dilute Pay's unmissability and violate the system's anti-goal of visual restraint. The secondary buttons are still *primary* register controls (large at 56px), but they speak in the calm secondary voice, not the urgent accent voice. This also satisfies WCAG 1.4.1 (color independence): scan-confirm is identified by its label text and an icon (checkmark/scan symbol), not by color shift alone.

---

## Layout Budget (Detailed)

The following table translates the "~9 rows" target into concrete pixel budgets for a 1024×768 floor viewport (landscape orientation, common iPad minimum):

| Component | Height | Rationale |
|-----------|--------|-----------|
| **Page header** | 56px | Typical Next.js/responsive app header (nav, branding, logout) — measured/confirmed during implementation |
| **Running total block** | 96px | `text-6xl` (36px) or `text-7xl` (42px) Fraunces numerals + 16px top padding + 16px bottom padding + 8px border top/bottom (visual separation); exact height TBD in implementation, but reserve ~96px to make this block dominate |
| **Upper padding** | 16px | Space between header and total block (breathing room) |
| **Lower padding** | 8px | Space between total block and cart list (tighter here to maximize cart space) |
| **Lower outer padding** | 8px | Space between cart list and page bottom (minimal, cart may have internal padding for scroll safety) |
| **Subtotal** | 184px | Header (56) + gap (16) + total block (96) + gap (8) + outer padding (8) |
| **Available for cart** | 584px | 768 − 184 |
| **Per cart row** | 64px | 56px qty control + 4px top padding + 4px bottom padding (tight but comfortable) |
| **Visible rows (div by 64)** | 9.125 rows | ≈ **9 full rows visible, 10th partially visible or scrollable** |

**Floor assumption:** This math assumes a 768px tall viewport (iPad 3:2 in landscape). Phones (360–414px width) or desktop widths will reflow; the register is primarily designed for tablet-class devices (1024px+ width, 600–768px height in landscape). A future implementation may use different breakpoints for phone vs. tablet.

---

## Side-by-Side Worked Examples

The following examples show the *same component* in dashboard calm vs. register adapted form, emphasizing what carries over (tokens, radius) and what changes (size, contrast choice, density).

### Example 1: Buttons

#### Dashboard Calm

**Primary action (Void Sale):**
```html
<button class="bg-accent hover:bg-accent-strong text-accent-foreground font-body font-semibold px-6 py-2 rounded-[var(--radius-button)] transition-colors duration-[var(--motion-fast)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent">
  Void Sale
</button>
```

**Secondary action (Adjust):**
```html
<button class="border border-border bg-surface text-foreground font-body font-semibold px-6 py-2 rounded-[var(--radius-button)] hover:bg-warm-gray transition-colors duration-[var(--motion-fast)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent">
  Adjust
</button>
```

#### Register Adapted

**Primary action (Pay):**
```html
<button class="bg-accent hover:bg-accent-strong text-accent-foreground font-body font-semibold px-8 py-4 min-h-14 min-w-14 text-lg rounded-[var(--radius-button)] transition-colors duration-[var(--motion-fast)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent">
  Pay
</button>
```

**Secondary action (Scan Confirm):**
```html
<button class="border border-border bg-surface text-foreground font-body font-semibold px-8 py-4 min-h-14 min-w-14 text-lg rounded-[var(--radius-button)] hover:bg-warm-gray transition-colors duration-[var(--motion-fast)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent">
  ✓ Confirm
</button>
```

**Quantity +/− control (Qty stepper):**
```html
<div class="flex gap-1 items-center">
  <button class="border border-border bg-surface text-foreground font-body font-semibold min-h-14 min-w-14 rounded-[var(--radius-button)] hover:bg-warm-gray transition-colors duration-[var(--motion-fast)]">−</button>
  <input type="number" class="w-16 text-center font-body text-foreground bg-surface border border-border rounded-[var(--radius-input)] py-2" value="2" />
  <button class="border border-border bg-surface text-foreground font-body font-semibold min-h-14 min-w-14 rounded-[var(--radius-button)] hover:bg-warm-gray transition-colors duration-[var(--motion-fast)]">+</button>
</div>
```

**What changed:**
- **Token set is identical:** `--accent`, `--accent-strong`, `--border`, `--surface`, `--foreground`, `--radius-button`, `--motion-fast` — all reused, none invented.
- **Size increased:** `px-6 py-2` (40px tall) → `px-8 py-4 min-h-14 min-w-14 text-lg` (56px tall, larger text).
- **Contrast unchanged:** Accent button still 6.5:1 (Pay); secondary buttons still use calm neutral palette.
- **Radius unchanged:** `--radius-button` (10px) applies to all, no sharp corners despite larger size.
- **Motion unchanged:** `--motion-fast` (150ms) on both, respects `prefers-reduced-motion`.

---

### Example 2: Running Total

#### Dashboard Calm

**Stat card with muted label and calm numerals:**
```html
<div class="bg-surface rounded-[var(--radius-card)] p-4 shadow-md border border-border">
  <p class="font-body text-foreground-muted text-sm mb-2">Today's Sales</p>
  <p class="font-display text-5xl font-semibold text-foreground tabular-nums">
    $1,234.56
  </p>
</div>
```

#### Register Adapted

**Inverted dark block, no label, dominant scale:**
```html
<div class="w-full bg-foreground text-surface px-4 py-5 rounded-none border-t border-b border-border">
  <p class="font-display text-6xl font-semibold tabular-nums font-bold">
    $47.89
  </p>
</div>
```

**What changed:**
- **Polarity inverted:** `bg-surface text-foreground` (dashboard calm) → `bg-foreground text-surface` (register inverted).
- **Contrast identical in math:** 16.2:1 on both (same verified token pair `--foreground` + `--surface`, just swapped); visually unmissable because it's the only dark block on a light page.
- **Label removed:** Dashboard's muted label ("Today's Sales") is gone; the register's running total is self-evident (it's the dark block showing the amount due).
- **Scale increased:** `text-5xl` (48px base) → `text-6xl` (60px base) or larger, full width, dominates the screen.
- **No shadow:** Dashboard card has `shadow-md` for layering; register block is flush and bold (no 3D, per anti-goals).
- **Full width:** The block spans edge-to-edge (or with minimal padding), no max-width constraint — maximizes visual presence.
- **Token reuse:** `--foreground`, `--surface`, `--font-display`, `--radius-card` (though register may remove radius entirely for a flush top border), `tabular-nums` utility — all existing, no new colors.

---

### Example 3: Cart Row

#### Dashboard Calm

**Receipt line item table row (spacious, muted secondary text for unit price):**
```html
<tr class="border-b border-border hover:bg-warm-gray/50 transition-colors duration-[var(--motion-base)]">
  <td class="font-body text-foreground py-3 px-4">
    Espresso (Double)
  </td>
  <td class="font-body text-foreground-muted text-right py-3 px-4 w-20 tabular-nums text-sm">
    $3.50 ea
  </td>
  <td class="font-body text-foreground text-right py-3 px-4 w-8 tabular-nums">
    2
  </td>
  <td class="font-body text-foreground text-right py-3 px-4 w-24 tabular-nums font-semibold">
    $7.00
  </td>
</tr>
```

#### Register Adapted

**Compact row with inline 56px qty stepper, no muted text:**
```html
<tr class="border-b border-border hover:bg-warm-gray/50 transition-colors duration-[var(--motion-base)]">
  <td class="font-body text-foreground py-2 px-3 flex-1">
    Espresso (Double)
  </td>
  <td class="font-body text-foreground text-right py-2 px-3 w-24 tabular-nums text-sm">
    $3.50 ea
  </td>
  <td class="font-body text-foreground text-right py-2 px-3">
    <div class="flex gap-1 items-center justify-end">
      <button class="border border-border bg-surface text-foreground font-body font-semibold min-h-10 min-w-10 rounded-[var(--radius-input)]">−</button>
      <span class="w-8 text-center font-semibold">2</span>
      <button class="border border-border bg-surface text-foreground font-body font-semibold min-h-10 min-w-10 rounded-[var(--radius-input)]">+</button>
    </div>
  </td>
  <td class="font-body text-foreground text-right py-2 px-3 w-24 tabular-nums font-bold">
    $7.00
  </td>
</tr>
```

**What changed:**
- **Vertical padding tightened:** `py-3` (12px) → `py-2` (8px) — density increase while keeping row ≥64px tall with the inline qty control.
- **Muted text eliminated:** Dashboard's unit price uses `--foreground-muted` (4.7:1); register's unit price uses `--foreground` (16.2:1) — cleaner, faster to read.
- **Qty control inlined:** Dashboard's QTY column is static text; register's QTY is an inline stepper (`min-h-10 min-w-10`, slightly smaller than the 56px primary Pay button for secondary control hierarchy, but still tap-safe). Note: this example shows compact 40px +/− buttons for the qty stepper; if the row needs to be taller to reach 64px budget, scale these up as needed.
- **Tokens unchanged:** All text uses `--foreground` (no muted variant), borders use `--border`, hover still uses `warm-gray/50`, motion still `--motion-base` (300ms). Radii are `--radius-input` on the qty buttons (6px, smaller than primary-button 10px).
- **Font weight increased on total:** The final column's price is `font-bold`, not just `font-semibold`, to ensure clarity at a glance.

---

## Accessibility & Contrast Summary

All register text pairings use contrast ratios pulled directly from `docs/design-direction.md` (no new hex values invented). Every ratio meets WCAG AA at minimum; most exceed it significantly:

| Token Pair | Hex (Light) | Ratio | Level | Register Use |
|-----------|-------------|-------|-------|-----|
| `--foreground` / `--background` | #20201C / #F5F4EF | 15.9:1 | AAA (large text, normal text) | Cart item names, unit prices, qty, tax line, regular text anywhere |
| `--foreground` / `--surface` | #20201C / #FAF9F5 | 16.2:1 | AAA (large text, normal text) | Running total (inverted: text on dark background), buttons, form input text |
| `--accent` / `--accent-foreground` | #CC785C / #20201C | 6.5:1 | AAA (large text); AA (normal text) | Pay button text / background — sufficient for both button text size (WCAG 3:1 large-text minimum) and exceeds AA normal-text floor |
| `--accent-strong` / `--accent-foreground` | #B85A3F / #20201C | 7.8:1 | AAA (all text) | Pay button hover/pressed state |

**Accessibility notes:**
- **No muted text on register:** The base doc's `--foreground-muted` (4.7:1) is not used on the register, even for secondary labels. Where visual hierarchy is needed, use type scale and weight instead.
- **56px targets exceed WCAG 2.5.5:** Minimum AA is 44×44px; AAA-adjacent best practice is 48×48px+. The register's 56px primary controls exceed both.
- **Pay button color is not the only identifier:** The Pay button is identified by its accent color AND its position (primary action, visually prominent size) AND its label text. Scan-confirm and qty controls are labeled with text and icons (checkmark, +/−), not identified by color alone (WCAG 1.4.1).
- **Focus rings carry over unchanged:** Outline 2px in `--accent`, offset 2px, visible on both light and dark elements (from base doc Example 3).
- **Motion respects preferences:** All transitions (`--motion-fast`, `--motion-base`) collapse to 0.01ms under `prefers-reduced-motion: reduce` — inherited from base doc, no register-specific override needed.

---

## Reviewer Checklist: "Does This Still Read as the Same Product?"

Before approving a `/pos` checkout implementation built on this doc, walk this checklist:

- [ ] **Terracotta accent is visible and used only on the Pay button.** No secondary accent colors introduced (no teal for "confirm," no gray for "cancel"). The rest of the screen uses the calm neutrals from the base doc.
- [ ] **The running total is the darkest, largest, most-prominent mass on screen.** Inverted polarity (dark on light) distinguishes it; no other element competes for visual dominance. A cashier can always glance at the dark block and know the amount due.
- [ ] **Button corner radius is 10px** (`--radius-button`) **on all buttons, regardless of size.** No sharp corners or arbitrary radii; the visual family is consistent with dashboard buttons.
- [ ] **All text is legible at a glance — no squinting required.** If you can't read a price or item name from arm's length, the contrast or size is wrong.
- [ ] **56px or larger hit targets for all primary controls** (Pay, scan-confirm, qty +/−). Thumb-size, not pencil-point, targets.
- [ ] **Type families are Fraunces (display/numerals) and Inter (body/UI).** No new faces introduced. The serif on the running total's numerals is the same editorial voice as the dashboard.
- [ ] **Motion is brief and smooth** — button press fades, qty change animates in ~150ms, no bouncing or distraction. Respects `prefers-reduced-motion`.
- [ ] **No neon, no rainbows, no casino-bright styling.** The palette is the same warm ivory/cream/terracotta family as the dashboard.
- [ ] **Muted text is nowhere on the register.** Every line item, price, and label uses `--foreground` for legibility, not `--foreground-muted`.
- [ ] **Secondary buttons (scan-confirm, qty controls) look calm and secondary,** not urgent. They don't use accent color; they use the neutral secondary treatment (border, surface, text-foreground) at enlarged 56px size.
- [ ] **Color is not the only way to identify actions.** Scan-confirm is labeled "Scan" or "Confirm" with a checkmark icon; qty +/− buttons are labeled with symbols (+, −); the Pay button's accent color is secondary to its label and size. No WCAG 1.4.1 violations.
- [ ] **No new custom colors, no unverified contrast ratios.** Every number (15.9:1, 16.2:1, 6.5:1, 56px, 10px radius) traces back to the base doc or is a direct architectural call (inversion, Tailwind scale match) — no "new tone" invented.

If all items check ✅, the register is visually coherent with the dashboard and ready for live review.

---

## What This Document Does NOT Cover

- **Component implementation:** No React/Vue/web-component code; no `/pos/checkout` route exists yet in the codebase. A later implementation card will build the checkout page using this spec as the source of truth.
- **New CSS custom properties:** This doc reuses tokens from `docs/design-direction.md` (already in `src/app/globals.css` as of commit c30cb46). No new `--register-*` variables are added; the register is a *mode* of the existing token set, not a separate palette.
- **Dark mode register variant:** The base doc establishes dark-mode token pairs; this doc focuses on light mode (the typical POS register context). A future card can define dark-mode register styling using the same dark-mode semantic tokens, maintaining consistency.
- **Payment processing, receipts, or other POS subsystems:** Checkout is the register screen; receipts, refunds, inventory, and loyalty are out of scope here.
- **Phone or small-screen register layout:** This doc assumes a tablet-class device (1024×768 landscape minimum). Phones are lower-priority for initial POS launch; a later breakpoint can adapt the layout for narrower screens.

---

## Implementation Guidance for a Later Card

When a future implementation card writes the `/pos/checkout` page and components using this doc as the spec:

1. **Treat the layout budget as a planning target, not a hard constraint.** Real header chrome, order status widgets, and other UI may consume more height; re-measure after implementing the header and adjust row height (and thus visible-row count) accordingly.

2. **Use Tailwind scale classes exactly as named:** `min-h-14`, `min-w-14`, `text-6xl`, `tabular-nums`, `rounded-[var(--radius-button)]`, etc. Avoid arbitrary values like `h-[56px]` when the scale already provides the measurement.

3. **Qty stepper controls can be smaller than the 56px Pay button** (e.g., `min-h-10` for qty +/− within a row) — they are secondary to the main Pay action, but still large enough to be tap-safe and not cramped.

4. **Running total block height depends on font size and padding.** Text-6xl Fraunces at 60px base + top/bottom padding (16px each) + border/separator (1–2px) lands around 94–96px; use that as the target, measure during implementation, and round to a clean multiple of 4px (Tailwind base unit) for consistency.

5. **Cart row height (64px target) depends on the qty control height and padding.** If qty stepper is `min-h-10` (40px), then outer row padding should be 12px (top) + 12px (bottom) to total 64px. Adjust if layout needs differ.

6. **Dark mode:** When dark-mode support is added, swap only the semantic color tokens (already defined in the base doc's `@media (prefers-color-scheme: dark)` section). The typography, sizes, radii, and motion stay the same.

7. **The register should still inherit motion/accessibility settings from the base system.** No need to re-define `--motion-fast` or focus ring styling — these are global and apply to all pages.

---

## Source of Truth & Maintenance

This document + `docs/design-direction.md` + the token definitions in `src/app/globals.css` and `src/app/layout.tsx` form the canonical design specification for the POS register. If a future color system refresh or token migration happens (e.g., a hex change, a new secondary accent), this doc should be updated to reflect the new values and re-verified against WCAG — but the *structure* (contrast floor, density, hit-target size, accent scarcity) remains stable.

### Known Risks (Design System Drift)

- **Doc/doc drift:** Nothing prevents this doc from drifting from the base doc if the base doc is updated. Flag this for future process/automation (e.g., a checklist in a PR template to update both docs together).
- **Doc/CSS drift:** Nothing enforces that new components use the exact token names and sizes specified here; a future component library or Storybook can codify these patterns and catch drift at review time.

Neither risk is in scope for this card; both are acknowledged so a later card can address them (e.g., a Storybook integration, a lint rule, a shared design-token schema).
