import '../src/app/globals.css'
import type { Preview } from '@storybook/react'
import React from 'react'
import { LocaleProvider, getAllCatalogs, pseudoLocalizeCatalog } from '../src/shared/i18n'

const preview: Preview = {
  globals: {
    theme: 'light',
    locale: 'en',
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for all components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
      },
    },
    locale: {
      name: 'Locale',
      description: 'Global locale and font',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'bn', title: 'Bengali' },
          { value: 'pseudo', title: 'Pseudo (length-stress)' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light'
      const locale = context.globals.locale || 'en'

      const themeClass = theme === 'dark' ? 'dark' : 'light'
      const localeClass = locale === 'bn' ? 'font-bengali' : 'font-body'
      const lang = locale === 'bn' ? 'bn' : 'en'

      const resolvedLocale = locale === 'bn' ? 'bn-BD' : 'en-US'
      const messagesOverride = locale === 'pseudo' ? pseudoLocalizeCatalog(getAllCatalogs()['en-US']) : undefined

      return (
        <div
          data-theme={theme}
          lang={lang}
          className={`${localeClass} bg-background text-foreground p-4`}
        >
          <LocaleProvider
            defaultLocale={resolvedLocale}
            timezone="UTC"
            currency={resolvedLocale === 'bn-BD' ? 'BDT' : 'USD'}
            useNativeDigits={resolvedLocale === 'bn-BD'}
            messagesOverride={messagesOverride}
          >
            <Story />
          </LocaleProvider>
        </div>
      )
    },
  ],
}

export default preview
