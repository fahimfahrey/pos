import type { TestRunnerConfig } from '@storybook/test-runner'
import { injectAxe, checkA11y } from 'axe-playwright'

// WCAG 2.2 AA automated gate for every story (docs/accessibility.md). `npm run
// test:storybook-a11y` fails the build the moment any story regresses.
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page) {
    await checkA11y(page, '#storybook-root', {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
        },
      },
      detailedReport: true,
      detailedReportOptions: { html: false },
    })
  },
}

export default config
