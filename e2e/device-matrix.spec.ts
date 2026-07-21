import { test, expect } from '@playwright/test'

// Visual snapshots of the checkout register and one back-office report across the real
// device matrix (docs/device-matrix.md): tablet, desktop, small POS, phone. Runs only in
// the tablet/desktop/small-pos/phone projects (playwright.config.ts), against Storybook so
// the two screens are reachable without a seeded, signed-in session (see docs/device-matrix.md).

const stories = [
  { name: 'checkout-register', storyId: 'devicematrix-registerlayout--with-cart' },
  { name: 'reports', storyId: 'devicematrix-reportsview--default' },
]

for (const { name, storyId } of stories) {
  test(`${name} layout matches snapshot`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
  })
}
