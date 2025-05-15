/**
 * Setup for Puppeteer tests with Jest
 */

const fs = require('fs');
const path = require('path');

// Create results directory if it doesn't exist
const resultsDir = path.join(__dirname, '../../results/puppeteer');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Set up Jest timeout
jest.setTimeout(30000);

// Add custom matchers if needed
expect.extend({
  // Example custom matcher for element visibility
  toBeVisible: async (element) => {
    const visible = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
    
    return {
      message: () =>
        `expected element ${visible ? 'not ' : ''}to be visible`,
      pass: visible,
    };
  },
});

// Global setup
beforeAll(async () => {
  console.log('Setting up Puppeteer test environment...');
});

// Global teardown
afterAll(async () => {
  console.log('Tearing down Puppeteer test environment...');
});
