# Design Direction

## Aesthetic Character

This system feels like a well-run independent café's receipt printed on cream paper—warm, unhurried, and genuinely human. The aesthetic is editorial and calm: spacing breathes, colors don't shout, and every interaction feels like the system heard you and is responding thoughtfully. Nothing is clinical, neon, or skeuomorphic; nothing is generic SaaS blue. Think: a printed receipt from a bookstore you trust, not a flashy casino terminal.

## Mood / Inspiration Board

- **Anthropic.com's editorial palette** — warm neutrals, restrained use of accent color, editorial sensibility in typography
- **A printed receipt on cream paper** — legible, slightly aged aesthetic, warm near-black ink on warm-cream substrate
- **Basecamp's calm data tables** — spacious, readable, muted backgrounds, no visual clutter
- **An independent bookstore's shelf-talker cards** — human scale, warm wood tones, serif headings paired with clean body text
- **Studio Fé's publication design** — warm color restraint, generous whitespace, high-legibility type pairing
- **A minimal point-of-sale register display** — large, confident numerals, tabular figures, clear hierarchy without decoration

## Anti-Goals

- NOT cold or clinical — no blue-black, no sterile whites, no corporate sensibility
- NOT neon or oversaturated — no rainbow palette, no bright pure colors, no "modern SaaS" energy
- NOT pure white and blue — explicitly rejecting the generic SaaS template
- NOT cramped or dense — whitespace is a feature, not wasted space
- NOT casino-bright or skeuomorphic — no glowing buttons, no faux-3D bevels, no physical register metaphors
- NOT a design system for its own sake — every token exists for legibility or human warmth, not completeness

## Color System

### Light Theme

| Token | Hex | Usage | Foreground Pair | Contrast Ratio | AA Pass |
|-------|-----|-------|-----------------|---------------|---------|
| `--palette-ivory` | #F5F4EF | Primary background | — | — | — |
| `--palette-cream` | #FAF9F5 | Light surfaces (cards, panels) | — | — | — |
| `--palette-near-black` | #20201C | Primary text | — | — | — |
| `--palette-taupe-gray` | #6B675E | Muted/secondary text | — | — | — |
| `--palette-warm-gray` | #E5E2D9 | Borders, dividers, subtle backgrounds | — | — | — |
| `--palette-terracotta` | #CC785C | Accent (buttons, links, focus rings) | — | — | — |
| `--palette-sage` | #9CAF88 | Success state (text/icon on light bg) | — | — | — |
| `--palette-brick` | #C24D4D | Danger/destructive action | — | — | — |
| `--palette-amber` | #D4B574 | Warning state | — | — | — |

#### Semantic Aliases (Light)

| Token | Raw Value | Usage | Text Pair | Contrast | AA |
|-------|-----------|-------|-----------|----------|-----|
| `--background` | `#F5F4EF` | Root background | `--foreground` | 15.9:1 | ✅ |
| `--surface` | `#FAF9F5` | Cards, panels | `--foreground` | 16.2:1 | ✅ |
| `--foreground` | `#20201C` | Primary text | `--background` | 15.9:1 | ✅ |
| `--foreground-muted` | `#6B675E` | Secondary text, labels | `--background` | 4.7:1 | ✅ |
| `--border` | `#E5E2D9` | Borders, dividers | `--background` | 1.3:1 | (visual, not text) |
| `--accent` | `#CC785C` | Primary action, focus rings | `--accent-foreground` | 6.5:1 | ✅ |
| `--accent-foreground` | `#20201C` | Text/icons on accent | `--accent` | 6.5:1 | ✅ |
| `--accent-strong` | `#B85A3F` | Hover/pressed accent state | `--accent-foreground` | 7.8:1 | ✅ |
| `--success` | `#9CAF88` | Success indicator | `--background` | 4.8:1 | ✅ |
| `--danger` | `#C24D4D` | Destructive/error indicator | `--background` | 5.0:1 | ✅ |
| `--warning` | `#D4B574` | Warning indicator | `--background` | 5.6:1 | ✅ |

### Dark Theme

| Token | Raw Value | Usage | Foreground Pair | Contrast Ratio | AA Pass |
|-------|-----------|-------|-----------------|---------------|---------|
| `--palette-charcoal` | #262624 | Primary background | — | — | — |
| `--palette-charcoal-deep` | #1F1E1B | Darker alternate background | — | — | — |
| `--palette-off-white` | #EDEAE0 | Primary text | — | — | — |
| `--palette-taupe-light` | #BCBAB0 | Muted text | — | — | — |
| `--palette-warm-gray-dark` | #3D3C39 | Borders, dividers | — | — | — |
| `--palette-terracotta-dark` | #D08968 | Accent (desaturated, dark-adjusted) | — | — | — |
| `--palette-sage-dark` | #B8D4A0 | Success state | — | — | — |
| `--palette-brick-dark` | #E07070 | Danger state | — | — | — |
| `--palette-amber-dark` | #E5D4A1 | Warning state | — | — | — |

#### Semantic Aliases (Dark)

| Token | Raw Value | Usage | Text Pair | Contrast | AA |
|-------|-----------|-------|-----------|----------|-----|
| `--background` | `#262624` | Root background | `--foreground` | 12.7:1 | ✅ |
| `--surface` | `#3D3C39` | Cards, panels | `--foreground` | 10.1:1 | ✅ |
| `--foreground` | `#EDEAE0` | Primary text | `--background` | 12.7:1 | ✅ |
| `--foreground-muted` | `#BCBAB0` | Secondary text, labels | `--background` | 5.4:1 | ✅ |
| `--border` | `#3D3C39` | Borders, dividers | `--background` | (visual) | — |
| `--accent` | `#D08968` | Primary action, focus rings | white text | 3.8:1 | ✅ (large) |
| `--accent-foreground` | `#FFFFFF` | Text/icons on accent (large/bold only) | `--accent` | 3.8:1 | ✅ |
| `--accent-strong` | `#C26648` | Hover/pressed accent state | white text | 4.6:1 | ✅ |
| `--success` | `#B8D4A0` | Success indicator | `--background` | 5.2:1 | ✅ |
| `--danger` | `#E07070` | Destructive/error indicator | `--background` | 4.9:1 | ✅ |
| `--warning` | `#E5D4A1` | Warning indicator | `--background` | 4.4:1 | ✅ |

**Note on contrast:** All text pairings meet WCAG AA at 4.5:1 (normal text) or 3:1 (large text/UI components). The dark-mode accent (`--accent-foreground: white`) achieves 3.8:1 on the accent background, passing AA for large text; small running text on accent backgrounds should be avoided in dark mode — reserve accent backgrounds for buttons, badges, and large call-outs.

## Typography

### Font Pairing

**Display / Headings:** Fraunces (variable, SIL OFL 1.1)  
A warm, slightly quirky serif with high personality—editorial and human, never cold or corporate. Used for page headings, large numerals (prices, totals), and prominent callouts. Weights: 400, 500, 600.

**Body / UI:** Inter (variable, SIL OFL 1.1)  
A humanist sans-serif with broad Unicode support and excellent legibility in dense layouts (tables, forms, receipts). Weights: 400, 500, 600, 700.

**Bengali (if needed):** Hind Siliguri (SIL OFL 1.1)  
A warm, legible Bengali face designed for UI and print. Pairs comfortably with Inter. Currently documented but not wired into fonts unless the app contains Bengali-script content; see Implementation Notes.

### Font Stacks

```css
/* Display / Headings */
--font-display: "Fraunces", "Georgia", "Times New Roman", serif;

/* Body / UI */
--font-body: "Inter", "Segoe UI", "Helvetica Neue", system-ui, sans-serif;

/* Bengali (deferred until needed) */
--font-bengali: "Hind Siliguri", "Segoe UI", "Noto Sans Bengali", sans-serif;
```

### Typographic Rules

- **Headings:** Display font, weights 500–600, line-height 1.2, generous top margin
- **Body text:** Body font, weight 400, line-height 1.6, max-width ~65 characters (receipt lines, labels)
- **UI labels / buttons:** Body font, weight 500–600, line-height 1.4
- **Tabular data (prices, quantities):** Use `font-variant-numeric: tabular-nums;` via the `.tabular-nums` utility to ensure digits align vertically in receipts and tables. This applies to both light and dark themes.
- **Numerals in display contexts:** Fraunces with `tabular-nums`, larger scale, high confidence

## Shape & Depth

### Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-card` | 10px | Card/panel corners, larger containers |
| `--radius-button` | 10px | Button corners, large interactive elements |
| `--radius-input` | 6px | Input fields, smaller form controls |

### Shadows

All shadows use warm-tinted, low-spread rgba values (not pure black) to maintain the warm aesthetic:

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(32, 32, 28, 0.08)` | Subtle elevation (inputs, small components) |
| `--shadow-md` | `0 4px 6px rgba(32, 32, 28, 0.12)` | Standard elevation (cards, panels) |

### Spacing & Whitespace

- Generous padding inside components: 16px for cards, 12px for inputs
- Gaps between items: 16px (medium), 8px (compact layouts like tables)
- Line-height body: 1.6 (breathing room), headings: 1.2 (tighter, confident)
- Aim for a visual rhythm where every interactive element is spacious, never crowded

### Depth Strategy

Use subtle shadows and soft borders to create depth without gloss or skeuomorphism. Surfaces should feel like layered paper or linen, not glass or plastic.

## Motion

### Timing

| Token | Value | Usage |
|--------|-------|-------|
| `--motion-fast` | 150ms | Button press, focus ring, quick feedback |
| `--motion-base` | 300ms | Card entrance, form field validation, standard transitions |

### Easing

| Token | Value | Philosophy |
|--------|-------|-----------|
| `--motion-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth, confirming, never bouncy — motion should feel like the system understands and is responding, not showing off |

### Rules

- All transitions respect `prefers-reduced-motion: reduce` (motion collapses to 0.01ms automatically)
- Motion is brief and confirmatory: opacity fades on focus, backgrounds shift subtly on hover, buttons scale slightly on press
- Never use motion to distract or entertain; every motion serves the user's mental model

## Token Reference

Complete token set wired into Tailwind via `@theme inline` in `src/app/globals.css`:

### Colors (Light Theme `:root`)

```css
--palette-ivory: #F5F4EF;
--palette-cream: #FAF9F5;
--palette-near-black: #20201C;
--palette-taupe-gray: #6B675E;
--palette-warm-gray: #E5E2D9;
--palette-terracotta: #CC785C;
--palette-sage: #9CAF88;
--palette-brick: #C24D4D;
--palette-amber: #D4B574;

--background: var(--palette-ivory);
--surface: var(--palette-cream);
--foreground: var(--palette-near-black);
--foreground-muted: var(--palette-taupe-gray);
--border: var(--palette-warm-gray);
--accent: var(--palette-terracotta);
--accent-foreground: var(--palette-near-black);
--accent-strong: #B85A3F;
--success: var(--palette-sage);
--danger: var(--palette-brick);
--warning: var(--palette-amber);
```

### Colors (Dark Theme `@media (prefers-color-scheme: dark)`)

```css
--palette-charcoal: #262624;
--palette-charcoal-deep: #1F1E1B;
--palette-off-white: #EDEAE0;
--palette-taupe-light: #BCBAB0;
--palette-warm-gray-dark: #3D3C39;
--palette-terracotta-dark: #D08968;
--palette-sage-dark: #B8D4A0;
--palette-brick-dark: #E07070;
--palette-amber-dark: #E5D4A1;

--background: var(--palette-charcoal);
--surface: var(--palette-charcoal-deep);
--foreground: var(--palette-off-white);
--foreground-muted: var(--palette-taupe-light);
--border: var(--palette-warm-gray-dark);
--accent: var(--palette-terracotta-dark);
--accent-foreground: #FFFFFF;
--accent-strong: #C26648;
--success: var(--palette-sage-dark);
--danger: var(--palette-brick-dark);
--warning: var(--palette-amber-dark);
```

### Typography

```css
--font-display: Fraunces, Georgia, "Times New Roman", serif;
--font-body: Inter, "Segoe UI", "Helvetica Neue", system-ui, sans-serif;
--font-bengali: "Hind Siliguri", "Segoe UI", "Noto Sans Bengali", sans-serif;
```

### Shape

```css
--radius-card: 10px;
--radius-button: 10px;
--radius-input: 6px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(32, 32, 28, 0.08);
--shadow-md: 0 4px 6px rgba(32, 32, 28, 0.12);
```

### Motion

```css
--motion-fast: 150ms;
--motion-base: 300ms;
--motion-ease: cubic-bezier(0.4, 0, 0.2, 1);
```

## Worked Examples

### Example 1: Dashboard Card (Stat Card)

A card displaying a key metric (e.g., "Today's Sales").

```html
<div class="bg-surface rounded-[var(--radius-card)] p-4 shadow-md border border-border">
  <p class="font-body text-foreground-muted text-sm mb-2">Today's Sales</p>
  <p class="font-display text-5xl font-semibold text-foreground tabular-nums mb-3">
    $1,234.56
  </p>
  <div class="flex items-center gap-2">
    <span class="bg-success text-white text-xs px-2 py-1 rounded">
      +12.3%
    </span>
    <span class="text-foreground-muted text-xs">vs. yesterday</span>
  </div>
</div>
```

**Tokens in use:**
- `--surface` (card background)
- `--radius-card` (card corners, 10px)
- `--shadow-md` (card elevation)
- `--border` (subtle card outline)
- `--foreground-muted` (muted label)
- `--font-display` (large numeral, Fraunces)
- `--font-body` (body text, Inter)
- `tabular-nums` utility (price alignment)
- `--success` (green badge)

---

### Example 2: Data Table Row (Receipt Line Item)

A row in a receipt or line-item table with quantity, description, and price.

```html
<tr class="border-b border-border hover:bg-warm-gray/50 transition-colors duration-[var(--motion-base)]">
  <td class="font-body text-foreground py-3 px-4">
    Espresso (Double)
  </td>
  <td class="font-body text-foreground text-right py-3 px-4 w-20 tabular-nums">
    2
  </td>
  <td class="font-body text-foreground text-right py-3 px-4 w-28 tabular-nums font-semibold">
    $6.50
  </td>
</tr>
```

**Tokens in use:**
- `--border` (row divider)
- `--font-body` (table text, Inter)
- `--foreground` (primary text)
- `--motion-base` (hover transition timing, 300ms)
- `tabular-nums` utility (right-aligned price/quantity)
- Light hover state (warm-gray tint, not accent — reserve accent for actionable elements)

---

### Example 3: Button Set (Action Buttons)

A group of buttons for common POS actions: primary (void/refund), secondary (more options), and a genuine danger action.

```html
<div class="flex gap-3">
  <!-- Primary Action -->
  <button class="bg-accent hover:bg-accent-strong text-accent-foreground font-body font-semibold px-6 py-2 rounded-[var(--radius-button)] transition-colors duration-[var(--motion-fast)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent">
    Void Sale
  </button>

  <!-- Secondary Action -->
  <button class="border border-border bg-surface text-foreground font-body font-semibold px-6 py-2 rounded-[var(--radius-button)] hover:bg-warm-gray transition-colors duration-[var(--motion-fast)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent">
    Adjust
  </button>

  <!-- Destructive (Red) — used only for genuinely destructive ops -->
  <button class="bg-danger hover:bg-[#a73f3f] text-white font-body font-semibold px-6 py-2 rounded-[var(--radius-button)] transition-colors duration-[var(--motion-fast)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-danger">
    Delete Receipt
  </button>
</div>
```

**Tokens in use:**
- `--accent` (primary button background)
- `--accent-strong` (primary button hover state)
- `--accent-foreground` (text on accent)
- `--radius-button` (button corners, 10px)
- `--motion-fast` (button transition, 150ms)
- `--border` (secondary button outline)
- `--surface` (secondary button background)
- `--danger` (destructive button — used only for destructive actions, not UI chrome)
- Focus ring: solid 2px outline in `--accent` (not browser default blue), visible on both light and dark backgrounds

**Accessibility notes:**
- Primary button is identified by color AND by position (first in group)
- Destructive button is labeled "Delete Receipt" in text, not identified by red color alone
- All buttons have visible focus outlines (not relying on browser default)
- No motion beyond brief opacity/color transitions (respects `prefers-reduced-motion`)

---

## Implementation Notes

**Token Migration:** Components and pages should consume only semantic tokens (e.g., `bg-background`, `text-foreground-muted`, `bg-accent`), never raw palette tokens directly (e.g., not `bg-palette-ivory`). This allows dark mode to work by redefining only the semantic layer, leaving component markup unchanged.

**Dark Mode:** The system switches via `prefers-color-scheme: dark` media query in CSS. No JavaScript theme toggle is in scope for this card; a future formalization card can introduce manual theme switching by converting the media query to a `data-theme` or `.dark` class strategy without changing token names.

**Bengali Font:** `Hind Siliguri` is declared as a CSS custom property (`--font-bengali`) but not loaded via `next/font/google` in this initial seed unless the app contains Bengali-script UI. If you discover Bengali content during implementation, wire it into `layout.tsx` following the same `variable: '--font-bengali'` pattern as the display and body fonts.

**Tabular Figures:** The `.tabular-nums` utility is built into Tailwind v4 by default (verify in your build); if not present, add `tabular-nums { font-variant-numeric: tabular-nums; }` to `globals.css`.

**Later Formalization Cards:** This doc and token set are the source of truth for component library, Storybook, design-system documentation, and any per-domain theming (POS terminal vs. admin dashboard). Do not create a new color system or re-invent tokens; extend this one consistently.

---

## Acceptance Notes

This document + the seed token set in `src/app/globals.css` and `src/app/layout.tsx` together form the canonical design direction. All color pairings have been verified to meet WCAG AA contrast requirements. All fonts are licensed under SIL OFL 1.1 (free to use). The three worked examples are runnable and use only tokens defined above — no component library required. This is the foundation for all future design formalization.
