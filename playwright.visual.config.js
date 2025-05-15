// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './test_scripts/visual',
  timeout: 30000,
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      // Visual comparison threshold configuration
      maxDiffPixelRatio: 0.01, // Allow 1% of pixels to be different
      threshold: 0.2, // Pixel RGB difference threshold
      animations: 'disabled', // Disable animations to avoid flakiness
    }
  },
  fullyParallel: false, // Run visual tests sequentially for more consistent results
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for visual tests to avoid false positives
  workers: 1, // Limit to 1 worker for visual tests
  reporter: [
    ['html', { outputFolder: './results/visual-report' }],
    ['json', { outputFile: './results/visual-results.json' }]
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'https://example.com',
    trace: 'on-first-retry',
    video: 'off', // Turn off video to avoid interference with screenshots
    screenshot: 'off', // Don't take automatic screenshots, we'll do it manually
    viewport: { width: 1280, height: 720 }, // Consistent viewport size
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // Only use Chrome for visual tests to reduce variation
  ],
});
