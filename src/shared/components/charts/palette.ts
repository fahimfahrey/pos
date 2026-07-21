/**
 * Data-viz palette access + shared formatting for the reporting charts.
 *
 * Colors live as CSS custom properties in globals.css (`--chart-1..8`,
 * `--chart-seq-0..4`, `--chart-grid`, `--chart-axis`, `--chart-axis-ink`) so a
 * single definition serves light and dark. Charts reference these by role via the
 * helpers below rather than hard-coding hex — the categorical set is a
 * colorblind-safe 8-hue ramp validated with the dataviz palette validator (worst
 * adjacent CVD ΔE 24.2 light / 10.3 dark). Series hues are assigned in fixed
 * order and never cycled; a 9th series folds into "Other".
 */

/** Number of distinct categorical hues before series must fold into "Other". */
export const CHART_SERIES_MAX = 8

/** CSS var reference for a categorical series slot (1-indexed in CSS, 0-indexed here). */
export function seriesColor(index: number): string {
  const slot = (index % CHART_SERIES_MAX) + 1
  return `var(--chart-${slot})`
}

/** Sequential terracotta ramp for magnitude encoding (0 = near-zero, 4 = peak). */
export const SEQ_STEPS = 5
export function seqColor(step: number): string {
  const clamped = Math.max(0, Math.min(SEQ_STEPS - 1, step))
  return `var(--chart-seq-${clamped})`
}

/**
 * Map a normalized magnitude (0..1) to a sequential ramp color. Exactly-zero
 * stays at the surface (recedes) via the caller; small positives get step 1 so a
 * non-zero cell is never invisible.
 */
export function seqColorFor(value: number, max: number): string {
  if (max <= 0 || value <= 0) return 'transparent'
  const t = value / max
  // 4 visible bands above zero: [0-.15) .15 .4 .7 1
  const step = t < 0.15 ? 1 : t < 0.4 ? 2 : t < 0.7 ? 3 : 4
  return seqColor(step)
}

// ── Money & number formatting ──────────────────────────────────────────────

/** Full currency from integer cents, e.g. 123456 → "$1,234.56". */
export function formatMoney(cents: number, currency = 'USD'): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency })
}

/** Compact currency for axis ticks, e.g. 123456 → "$1.2k". */
export function formatMoneyShort(cents: number, currency = 'USD'): string {
  const dollars = cents / 100
  const abs = Math.abs(dollars)
  const sign = dollars < 0 ? '-' : ''
  const symbol = currency === 'USD' ? '$' : ''
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`
  return `${sign}${symbol}${abs.toFixed(0)}`
}

/** Integer count with thousands separators. */
export function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

/** Percentage, e.g. 0.234 → "23.4%". */
export function formatPercent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`
}
