import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('marketing page loads with main heading', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByRole('heading', { name: /Welcome to POS System/i })
    await expect(heading).toBeVisible()
  })

  test('/api/health returns ok', async ({ page }) => {
    const response = await page.goto('/api/health')
    expect(response?.status()).toBe(200)
    const json = await response?.json()
    expect(json).toEqual({ status: 'ok' })
  })

  test('manifest is served', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest')
    expect(response?.status()).toBe(200)
    const contentType = response?.headers()['content-type']
    expect(contentType).toContain('application/json')
  })

  test('service worker is served', async ({ page }) => {
    const response = await page.goto('/sw.js')
    expect(response?.status()).toBe(200)
  })
})
