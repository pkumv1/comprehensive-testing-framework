/**
 * Jest configuration for Puppeteer tests
 */

module.exports = {
  rootDir: '../../',
  testMatch: ['<rootDir>/test_scripts/puppeteer/**/*.test.js'],
  testTimeout: 30000,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/results/puppeteer',
      outputName: 'junit.xml'
    }]
  ],
  setupFilesAfterEnv: ['<rootDir>/test_scripts/puppeteer/setup.js'],
  testEnvironment: 'node',
  verbose: true
};
