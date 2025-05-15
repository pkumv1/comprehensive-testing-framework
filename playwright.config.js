// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './test_scripts/playwright',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './results/playwright-report' }],
    ['json', { outputFile: './results/playwright-results.json' }]
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'https://example.com',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Enable self-healing tests by using multiple selectors and making tests more resilient
    // We achieve this through custom selector engines and parameterization
    selectors: [
      // Add custom selector engines
      { name: 'data-testid', query: (selector) => `[data-testid="${selector}"]` },
      { name: 'aria-label', query: (selector) => `[aria-label="${selector}"]` },
      { name: 'test-id', query: (selector) => `[data-test-id="${selector}"]` },
    ],
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security']
        }
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
});
