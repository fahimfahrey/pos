import '../src/app/globals.css'
import type { Preview } from '@storybook/react'
import React from 'react'

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

      return (
        <div
          data-theme={theme}
          lang={lang}
          className={`${localeClass} bg-background text-foreground p-4`}
        >
          <Story />
        </div>
      )
    },
  ],
}

export default preview
