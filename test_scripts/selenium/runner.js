/**
 * Selenium Test Runner
 * 
 * This script runs Selenium tests and reports results.
 */

const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');

// Output directory for results
const resultsDir = path.join(__dirname, '../../results/selenium');

// Ensure results directory exists
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Set up Mocha
const mocha = new Mocha({
  reporter: 'spec',
  timeout: 30000
});

// Add all test files
const testDir = __dirname;
fs.readdirSync(testDir)
  .filter(file => file.endsWith('_test.js') || file.endsWith('.test.js'))
  .forEach(file => {
    mocha.addFile(path.join(testDir, file));
  });

// Create a reporter that saves results to file
class FileReporter {
  constructor(runner) {
    const results = {
      stats: {},
      tests: [],
      failures: [],
      passes: []
    };

    runner.on('start', () => {
      console.log('Starting Selenium tests...');
    });

    runner.on('test', test => {
      console.log(`Running test: ${test.title}`);
    });

    runner.on('pass', test => {
      results.passes.push({
        title: test.title,
        fullTitle: test.fullTitle(),
        duration: test.duration
      });
    });

    runner.on('fail', (test, err) => {
      results.failures.push({
        title: test.title,
        fullTitle: test.fullTitle(),
        error: {
          message: err.message,
          stack: err.stack
        }
      });
    });

    runner.on('end', () => {
      results.stats = runner.stats;
      console.log(`Finished: ${results.stats.passes}/${results.stats.tests} tests passed`);
      fs.writeFileSync(
        path.join(resultsDir, 'selenium-results.json'),
        JSON.stringify(results, null, 2)
      );
    });
  }
}

// Add custom reporter
mocha.reporter(FileReporter);

// Run the tests
mocha.run(failures => {
  process.exitCode = failures ? 1 : 0;
});
