import en from './messages/en.json'
import bn from './messages/bn.json'
import { DEFAULT_LOCALE, type LocaleCode } from './locales'

export type MessageCatalog = Record<string, unknown>

const CATALOGS: Record<LocaleCode, MessageCatalog> = {
  'en-US': en,
  'bn-BD': bn,
}

export type TranslateVars = Record<string, string | number> | undefined

export type Translator = (key: string, vars?: TranslateVars, count?: number) => string

function getPath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((acc, segment) => (acc && typeof acc === 'object' ? (acc as MessageCatalog)[segment] : undefined), obj)
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

/**
 * `catalogOverride` lets tests (pseudo-localization, length-stress) swap in a
 * synthetic catalog without touching the real en/bn message files.
 */
export function createTranslator(locale: LocaleCode, catalogOverride?: MessageCatalog): Translator {
  const catalog = catalogOverride ?? CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE]
  const fallback = CATALOGS[DEFAULT_LOCALE]

  return function t(key, vars, count) {
    let lookupKey = key

    if (typeof count === 'number') {
      const category = new Intl.PluralRules(locale).select(count)
      const pluralKey = `${key}.${category}`
      const hasCategory = getPath(catalog, pluralKey) !== undefined || getPath(fallback, pluralKey) !== undefined
      lookupKey = hasCategory ? pluralKey : `${key}.other`
    }

    const value = getPath(catalog, lookupKey) ?? getPath(fallback, lookupKey)

    if (typeof value !== 'string') {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing translation for key "${lookupKey}" (locale "${locale}")`)
      }
      return key
    }

    return interpolate(value, typeof count === 'number' ? { count, ...vars } : vars)
  }
}

export function getAllCatalogs(): Record<LocaleCode, MessageCatalog> {
  return CATALOGS
}
