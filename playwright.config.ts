import { defineConfig, devices } from '@playwright/test'

const STORYBOOK_URL = 'http://localhost:6006'

// Device matrix (docs/device-matrix.md) — the four real devices this product ships to.
// These four projects only run e2e/device-matrix.spec.ts (against Storybook, see webServer
// below); the default `chromium` project keeps running everything else against the app.
const deviceMatrixProjects = [
  {
    name: 'tablet',
    use: {
      baseURL: STORYBOOK_URL,
      viewport: { width: 1024, height: 768 },
      hasTouch: true,
      isMobile: false,
    },
    testMatch: /device-matrix\.spec\.ts/,
  },
  {
    name: 'desktop',
    use: {
      baseURL: STORYBOOK_URL,
      viewport: { width: 1280, height: 800 },
      hasTouch: false,
      isMobile: false,
    },
    testMatch: /device-matrix\.spec\.ts/,
  },
  {
    name: 'small-pos',
    use: {
      baseURL: STORYBOOK_URL,
      viewport: { width: 1024, height: 600 },
      hasTouch: true,
      isMobile: false,
    },
    testMatch: /device-matrix\.spec\.ts/,
  },
  {
    name: 'phone',
    use: {
      baseURL: STORYBOOK_URL,
      ...devices['iPhone 13'],
    },
    testMatch: /device-matrix\.spec\.ts/,
  },
]

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /device-matrix\.spec\.ts/,
    },
    ...deviceMatrixProjects,
  ],

  webServer: [
    {
      command: 'npm run build && npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run storybook -- --ci',
      url: STORYBOOK_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
