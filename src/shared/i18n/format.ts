import { LOCALES, type LocaleCode } from './locales'

export interface FormatterOptions {
  timezone: string
  currency: string
  /** Tenant preference: render digits in the locale's native numbering system (e.g. Bengali ০-৯). */
  useNativeDigits?: boolean
}

export interface Formatters {
  money: (valueInCents: number, currencyOverride?: string) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
  date: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
}

/**
 * Explicit `numberingSystem` (rather than relying on the locale's CLDR default)
 * because some locales — bn-BD included — default to native digits already.
 * Setting it directly is the only way to guarantee Latin digits when the
 * tenant hasn't opted into native ones, and native digits when they have.
 */
function resolveNumberingSystem(locale: LocaleCode, useNativeDigits?: boolean): string {
  if (!useNativeDigits) return 'latn'
  return LOCALES[locale]?.nativeNumberingSystem ?? 'latn'
}

export function createFormatters(locale: LocaleCode, options: FormatterOptions): Formatters {
  const numberingSystem = resolveNumberingSystem(locale, options.useNativeDigits)

  return {
    money: (valueInCents, currencyOverride) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyOverride ?? options.currency,
        numberingSystem,
      }).format(valueInCents / 100),

    number: (value, numberOptions) => new Intl.NumberFormat(locale, { numberingSystem, ...numberOptions }).format(value),

    date: (value, dateOptions) =>
      new Intl.DateTimeFormat(locale, { timeZone: options.timezone, numberingSystem, ...dateOptions }).format(
        value instanceof Date ? value : new Date(value)
      ),
  }
}
