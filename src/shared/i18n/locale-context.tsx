'use client'

import * as React from 'react'
import { DEFAULT_LOCALE, getLocaleDir, resolveLocale, type LocaleCode } from './locales'
import { createTranslator, type MessageCatalog, type Translator } from './translate'
import { createFormatters, type Formatters } from './format'

const LOCALE_STORAGE_KEY = 'pos:locale-override'
const LOCALE_COOKIE_KEY = 'locale'

interface LocaleContextValue {
  locale: LocaleCode
  dir: 'ltr' | 'rtl'
  timezone: string
  useNativeDigits: boolean
  t: Translator
  formatters: Formatters
  setLocale: (locale: LocaleCode) => void
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)

export interface LocaleProviderProps {
  children: React.ReactNode
  /** Server-resolved default, driven by org/branch settings (see settings-resolver). */
  defaultLocale: LocaleCode
  timezone: string
  currency: string
  useNativeDigits?: boolean
  /** Test-only hook: inject a synthetic catalog (e.g. pseudo-localized) instead of the real one. */
  messagesOverride?: MessageCatalog
}

export function LocaleProvider({
  children,
  defaultLocale,
  timezone,
  currency,
  useNativeDigits = false,
  messagesOverride,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = React.useState<LocaleCode>(defaultLocale)

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored) setLocaleState(resolveLocale(stored))
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = getLocaleDir(locale)
  }, [locale])

  const setLocale = React.useCallback((next: LocaleCode) => {
    setLocaleState(next)
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
    document.cookie = `${LOCALE_COOKIE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`
  }, [])

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: getLocaleDir(locale),
      timezone,
      useNativeDigits,
      t: createTranslator(locale, messagesOverride),
      formatters: createFormatters(locale, { timezone, currency, useNativeDigits }),
      setLocale,
    }),
    [locale, timezone, currency, useNativeDigits, messagesOverride, setLocale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

function useLocaleContext(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext)
  if (!ctx) {
    // Non-fatal fallback so components can be rendered in isolation (e.g. Storybook
    // stories that don't wrap in LocaleProvider) without crashing the whole tree.
    return {
      locale: DEFAULT_LOCALE,
      dir: 'ltr',
      timezone: 'UTC',
      useNativeDigits: false,
      t: createTranslator(DEFAULT_LOCALE),
      formatters: createFormatters(DEFAULT_LOCALE, { timezone: 'UTC', currency: 'USD' }),
      setLocale: () => {},
    }
  }
  return ctx
}

export function useTranslations(): Translator {
  return useLocaleContext().t
}

export function useFormatters(): Formatters {
  return useLocaleContext().formatters
}

export function useLocale() {
  const { locale, dir, setLocale } = useLocaleContext()
  return { locale, dir, setLocale }
}
