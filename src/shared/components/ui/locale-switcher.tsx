'use client'

import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { useLocale, useTranslations } from '@shared/i18n'
import { SUPPORTED_LOCALES, type LocaleCode } from '@shared/i18n/locales'

interface LocaleSwitcherProps {
  compact?: boolean
}

export function LocaleSwitcher({ compact = false }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const t = useTranslations()

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <label htmlFor="locale-switcher" className="sr-only">
          {t('localeSwitcher.label')}
        </label>
      )}
      <Select value={locale} onValueChange={(value) => setLocale(value as LocaleCode)}>
        <SelectTrigger id="locale-switcher" aria-label={t('localeSwitcher.label')} className={compact ? 'h-8 w-auto min-w-24 px-2 text-xs' : 'w-40'}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LOCALES.map((code) => (
            <SelectItem key={code} value={code}>
              {t(`localeSwitcher.${code}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
