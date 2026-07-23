import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// WCAG 2.2 AA automated gate (docs/accessibility.md). Runs axe-core against every route that
// can be reached without a signed-in session, plus the two page-level Storybook stories that
// stand in for the routes that currently require one (see docs/device-matrix.md's "Testing"
// section — /pos/checkout and /app/reports need a signed-in session and IndexedDB onboarding
// state that isn't reliably scriptable yet).
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

const publicRoutes = ['/', '/login', '/signup', '/onboarding']

for (const route of publicRoutes) {
  test(`${route} has no automatic WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
}

const storybookPages = [
  { name: 'checkout register (register-layout story)', storyId: 'devicematrix-registerlayout--with-cart' },
  { name: 'reports (reports-view story)', storyId: 'devicematrix-reportsview--default' },
]

for (const { name, storyId } of storybookPages) {
  test(`${name} has no automatic WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
}
