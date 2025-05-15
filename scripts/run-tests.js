/**
 * Test Runner Script
 * 
 * This script demonstrates running tests with different frameworks and collecting results.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration for test runs
const config = {
  outputDir: path.join(__dirname, '../results'),
  testCommands: [
    { name: 'playwright', command: 'npx', args: ['playwright', 'test'], label: 'Playwright Tests' },
    { name: 'selenium', command: 'node', args: ['test_scripts/selenium/runner.js'], label: 'Selenium Tests' },
    { name: 'puppeteer', command: 'npx', args: ['jest', '--config=test_scripts/puppeteer/jest.config.js'], label: 'Puppeteer Tests' },
    { name: 'visual', command: 'npx', args: ['playwright', 'test', '--config=playwright.visual.config.js'], label: 'Visual Tests' },
    { name: 'accessibility', command: 'npx', args: ['playwright', 'test', '--config=playwright.a11y.config.js'], label: 'Accessibility Tests' },
    { name: 'api', command: 'npx', args: ['jest', '--testPathPattern=api'], label: 'API Tests' },
    { name: 'performance', command: 'node', args: ['test_scripts/performance/run-performance.js'], label: 'Performance Tests' },
  ]
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

/**
 * Run a command and return its output
 * @param {string} command - Command to run
 * @param {Array<string>} args - Command arguments
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
async function runCommand(command, args) {
  return new Promise((resolve) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const proc = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      console.log(text);
    });
    
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      console.error(text);
    });
    
    proc.on('close', (exitCode) => {
      console.log(`Command completed with exit code: ${exitCode}`);
      resolve({ exitCode, stdout, stderr });
    });
  });
}

/**
 * Run tests with all frameworks
 */
async function runTests() {
  console.log('Starting test execution...');
  console.log('==========================');
  
  const results = [];
  
  // Run each test command
  for (const testCommand of config.testCommands) {
    console.log(`\n\n=== Running ${testCommand.label} ===`);
    
    const startTime = Date.now();
    const result = await runCommand(testCommand.command, testCommand.args);
    const duration = (Date.now() - startTime) / 1000;
    
    results.push({
      name: testCommand.name,
      label: testCommand.label,
      exitCode: result.exitCode,
      duration,
      success: result.exitCode === 0
    });
    
    // Write output to results directory
    const outputFile = path.join(config.outputDir, `${testCommand.name}-output.txt`);
    fs.writeFileSync(outputFile, `${result.stdout}\n\n${result.stderr}`);
    
    console.log(`\n=== Completed ${testCommand.label} (${duration.toFixed(1)}s) ===`);
  }
  
  // Print summary
  console.log('\n\n=== Test Execution Summary ===');
  console.log('Framework\tStatus\tDuration');
  console.log('----------------------------------');
  
  let successCount = 0;
  let totalDuration = 0;
  
  for (const result of results) {
    const status = result.success ? 'PASS' : 'FAIL';
    console.log(`${result.label}\t${status}\t${result.duration.toFixed(1)}s`);
    
    if (result.success) {
      successCount++;
    }
    
    totalDuration += result.duration;
  }
  
  console.log('----------------------------------');
  console.log(`Overall: ${successCount}/${results.length} passed (${totalDuration.toFixed(1)}s)`);
  
  // Write summary to results directory
  const summaryFile = path.join(config.outputDir, 'test-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed: successCount,
      failed: results.length - successCount,
      duration: totalDuration
    }
  }, null, 2));
  
  console.log(`\nTest summary written to: ${summaryFile}`);
  
  // Generate report
  console.log('\nGenerating test report...');
  await runCommand('node', ['scripts/generate-report.js']);
  
  // Return overall success/failure
  return successCount === results.length;
}

// Run if called directly (not imported)
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}

module.exports = { runTests, runCommand };
