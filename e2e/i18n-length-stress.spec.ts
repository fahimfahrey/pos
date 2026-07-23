import { test, expect } from '@playwright/test'

// Length-stress + pseudo-localization gate for src/shared/i18n: renders the register and its
// two most overflow-prone modals (fixed-width reason buttons, an interpolated welcome message)
// under Bengali and pseudo-localized (accented + ~40% padded) strings, then asserts the layout
// never grows a horizontal scrollbar. jsdom can't lay out real fonts/text metrics, so unlike
// the vitest suite this runs against Storybook in a real Chromium engine (see device-matrix.spec.ts
// for the same iframe.html pattern).
const stories = [
  { name: 'checkout-register', storyId: 'devicematrix-registerlayout--with-cart' },
  { name: 'void-sale-modal', storyId: 'devicematrix-voidsalemodal--default' },
  { name: 'open-shift-panel', storyId: 'devicematrix-openshiftpanel--default' },
]

const locales = ['bn', 'pseudo'] as const

for (const { name, storyId } of stories) {
  for (const locale of locales) {
    test(`${name} has no horizontal overflow under ${locale} strings`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${storyId}&viewMode=story&globals=locale:${locale}`)
      await page.waitForLoadState('networkidle')

      const viewportWidth = page.viewportSize()?.width ?? 1280

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth, `${name} (${locale}): page grew a horizontal scrollbar`).toBeLessThanOrEqual(viewportWidth + 1)

      // Buttons are the highest-risk element: fixed padding + a translated label that can
      // expand well beyond the source English string.
      const clippedButtons = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).filter((el) => el.scrollWidth > el.clientWidth + 1).length
      )
      expect(clippedButtons, `${name} (${locale}): button text overflowed its own box`).toBe(0)
    })
  }
}
