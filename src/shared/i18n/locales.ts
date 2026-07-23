export type LocaleCode = 'en-US' | 'bn-BD'

export interface LocaleDefinition {
  code: LocaleCode
  englishName: string
  nativeName: string
  dir: 'ltr' | 'rtl'
  /** Intl numbering system to use when the tenant prefers native digits. */
  nativeNumberingSystem: string
  fontVariable: string
}

export const LOCALES: Record<LocaleCode, LocaleDefinition> = {
  'en-US': {
    code: 'en-US',
    englishName: 'English',
    nativeName: 'English',
    dir: 'ltr',
    nativeNumberingSystem: 'latn',
    fontVariable: 'var(--font-body)',
  },
  'bn-BD': {
    code: 'bn-BD',
    englishName: 'Bengali',
    nativeName: 'বাংলা',
    dir: 'ltr',
    nativeNumberingSystem: 'beng',
    fontVariable: 'var(--font-bengali)',
  },
}

export const DEFAULT_LOCALE: LocaleCode = 'en-US'

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as LocaleCode[]

export function isSupportedLocale(value: string | null | undefined): value is LocaleCode {
  return !!value && Object.prototype.hasOwnProperty.call(LOCALES, value)
}

/**
 * Falls back to the base language (e.g. "bn" from "bn-IN") so tenant settings
 * using a region we don't ship a catalog for still resolve sensibly, and
 * finally to DEFAULT_LOCALE. Keeps `dir` infrastructure generic so a future
 * RTL locale (e.g. Arabic/Urdu) only needs an entry in LOCALES, not a rewrite.
 */
export function resolveLocale(value: string | null | undefined): LocaleCode {
  if (isSupportedLocale(value)) return value
  const base = value?.split('-')[0]
  const match = SUPPORTED_LOCALES.find((code) => code.split('-')[0] === base)
  return match ?? DEFAULT_LOCALE
}

export function getLocaleDir(locale: LocaleCode): 'ltr' | 'rtl' {
  return LOCALES[locale]?.dir ?? 'ltr'
}
