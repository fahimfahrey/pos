/**
 * Format a monetary value using Intl.NumberFormat.
 * Mirrors the pattern used in display-cart-view but shared for register.
 */
export function formatMoney(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount / 100) // Convert cents to dollars
}
