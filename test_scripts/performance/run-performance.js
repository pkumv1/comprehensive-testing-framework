/**
 * Performance Test Runner
 * 
 * This script runs performance tests and collects metrics.
 */

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const config = {
  outputDir: path.join(__dirname, '../../results/performance'),
  k6Script: path.join(__dirname, 'load_test.js'),
  scenarios: [
    { name: 'smoke', vus: 1, duration: '10s', tags: 'smoke' },
    { name: 'load', vus: 10, duration: '30s', tags: 'load' },
    { name: 'stress', vus: 30, duration: '60s', tags: 'stress' }
  ]
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

/**
 * Run a k6 performance test
 * @param {Object} scenario - Test scenario configuration
 */
async function runK6Test(scenario) {
  console.log(`Running ${scenario.name} test (${scenario.vus} VUs, ${scenario.duration})...`);
  
  const outputFile = path.join(config.outputDir, `${scenario.name}-results.json`);
  
  try {
    // Build k6 command
    const command = [
      'k6 run',
      `--vus ${scenario.vus}`,
      `--duration ${scenario.duration}`,
      `--tag testType=${scenario.name}`,
      `--out json=${outputFile}`,
      config.k6Script
    ].join(' ');
    
    // Execute k6 command
    const { stdout, stderr } = await exec(command);
    
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`${scenario.name} test completed. Results saved to ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`Error running ${scenario.name} test:`, error.message);
    
    // Still save any output
    if (error.stdout) {
      fs.writeFileSync(
        path.join(config.outputDir, `${scenario.name}-output.txt`),
        error.stdout
      );
    }
    
    return false;
  }
}

/**
 * Main function to run all performance tests
 */
async function runPerformanceTests() {
  console.log('Starting performance tests...');
  console.log('============================');
  
  const startTime = Date.now();
  const results = [];
  
  // Run each scenario
  for (const scenario of config.scenarios) {
    const success = await runK6Test(scenario);
    results.push({
      scenario: scenario.name,
      success
    });
  }
  
  const duration = (Date.now() - startTime) / 1000;
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    duration: duration.toFixed(1),
    scenarios: results,
    totalSuccess: results.filter(r => r.success).length,
    totalScenarios: results.length
  };
  
  // Save summary
  fs.writeFileSync(
    path.join(config.outputDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // Log summary
  console.log('\nPerformance Test Summary:');
  console.log(`Duration: ${duration.toFixed(1)}s`);
  console.log(`Scenarios: ${summary.totalSuccess}/${summary.totalScenarios} successful`);
  console.log('============================');
  
  // Return success status
  return summary.totalSuccess === summary.totalScenarios;
}

// Run if called directly
if (require.main === module) {
  runPerformanceTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error running performance tests:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceTests, runK6Test };
