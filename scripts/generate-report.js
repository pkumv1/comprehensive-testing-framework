/**
 * Test Results Report Generator
 * 
 * This script processes test results from different frameworks and generates
 * a comprehensive HTML report with metrics, KPIs, and visualizations.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  resultsDir: path.join(__dirname, '../results'),
  outputFile: path.join(__dirname, '../results/report.html'),
  coverageThreshold: 80, // Minimum acceptable coverage percentage
  frameworks: ['playwright', 'selenium', 'puppeteer'],
  testTypes: [
    'unit',
    'integration',
    'system',
    'acceptance',
    'regression',
    'performance',
    'security',
    'accessibility',
    'api',
    'visual'
  ]
};

// Simulated test results for demonstration
// In a real implementation, this would parse actual result files
function collectTestResults() {
  console.log('Collecting test results from:', config.resultsDir);
  
  // Simulated data for the example
  return {
    summary: {
      total: 87,
      passed: 79,
      failed: 5,
      skipped: 3,
      duration: 142.5, // seconds
      coverage: 84.3
    },
    frameworks: {
      playwright: { total: 42, passed: 40, failed: 1, skipped: 1, duration: 68.2 },
      selenium: { total: 25, passed: 22, failed: 2, skipped: 1, duration: 45.8 },
      puppeteer: { total: 20, passed: 17, failed: 2, skipped: 1, duration: 28.5 }
    },
    testTypes: {
      unit: { total: 25, passed: 24, failed: 1, skipped: 0, coverage: 92.1 },
      integration: { total: 18, passed: 16, failed: 1, skipped: 1, coverage: 85.7 },
      system: { total: 8, passed: 7, failed: 0, skipped: 1, coverage: 78.3 },
      acceptance: { total: 6, passed: 6, failed: 0, skipped: 0, coverage: 100.0 },
      regression: { total: 12, passed: 11, failed: 1, skipped: 0, coverage: 89.2 },
      performance: { total: 5, passed: 4, failed: 1, skipped: 0, coverage: null },
      security: { total: 7, passed: 6, failed: 1, skipped: 0, coverage: null },
      accessibility: { total: 4, passed: 3, failed: 0, skipped: 1, coverage: null },
      api: { total: 6, passed: 6, failed: 0, skipped: 0, coverage: 88.5 },
      visual: { total: 6, passed: 6, failed: 0, skipped: 0, coverage: null }
    },
    kpis: {
      codeCoverage: 84.3, // percentage
      testDebt: 12, // number of known issues/skipped tests
      riskScore: 'Low', // risk assessment
      maintenanceIndex: 76 // maintainability score
    },
    failedTests: [
      { name: 'Login validation - Email format', type: 'unit', framework: 'playwright', message: 'Expected validation error to be visible' },
      { name: 'Password strength meter', type: 'integration', framework: 'selenium', message: 'Expected strength indicator to show "strong"' },
      { name: 'API response time', type: 'performance', framework: 'playwright', message: 'Expected response time to be < 200ms but was 350ms' },
      { name: 'XSS prevention', type: 'security', framework: 'puppeteer', message: 'Found potential XSS vulnerability' },
      { name: 'Mobile responsive layout', type: 'regression', framework: 'selenium', message: 'Layout breaks at 320px width' }
    ]
  };
}

// Calculate metrics and KPIs from the test results
function calculateMetrics(results) {
  const metrics = {
    passRate: (results.summary.passed / results.summary.total) * 100,
    failRate: (results.summary.failed / results.summary.total) * 100,
    skipRate: (results.summary.skipped / results.summary.total) * 100,
    avgDuration: results.summary.duration / results.summary.total,
    coverageStatus: results.summary.coverage >= config.coverageThreshold ? 'Pass' : 'Fail',
    coverageDiff: results.summary.coverage - config.coverageThreshold,
    riskFactor: calculateRiskFactor(results)
  };
  
  return metrics;
}

// Calculate a risk factor based on test results
function calculateRiskFactor(results) {
  // Simple risk calculation - in a real scenario this would be more sophisticated
  const criticalAreaFailure = results.failedTests.some(test => 
    test.type === 'security' || test.type === 'regression'
  );
  
  const lowCoverageAreas = Object.entries(results.testTypes)
    .filter(([_, data]) => data.coverage !== null && data.coverage < config.coverageThreshold)
    .map(([type, _]) => type);
  
  return {
    score: criticalAreaFailure ? 'High' : (lowCoverageAreas.length > 0 ? 'Medium' : 'Low'),
    criticalFailures: results.failedTests.filter(test => 
      test.type === 'security' || test.type === 'regression'
    ),
    lowCoverageAreas
  };
}

// Generate HTML report from the collected data
function generateReport(results, metrics) {
  console.log('Generating report to:', config.outputFile);
  
  // This would typically generate a more comprehensive HTML report
  // For this example, we'll create a simple HTML structure
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .header { background-color: #f5f5f5; padding: 20px; margin-bottom: 20px; }
    .summary { display: flex; justify-content: space-between; flex-wrap: wrap; }
    .summary-card { background-color: white; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 10px; min-width: 200px; }
    .pass { color: green; }
    .fail { color: red; }
    .warning { color: orange; }
    .metric-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
    .section { margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    tr:hover { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Results Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="section">
    <h2>Summary</h2>
    <div class="summary">
      <div class="summary-card">
        <h3>Tests</h3>
        <div class="metric-value">${results.summary.total}</div>
        <div>Passed: <span class="pass">${results.summary.passed}</span></div>
        <div>Failed: <span class="fail">${results.summary.failed}</span></div>
        <div>Skipped: <span class="warning">${results.summary.skipped}</span></div>
      </div>
      
      <div class="summary-card">
        <h3>Pass Rate</h3>
        <div class="metric-value ${metrics.passRate > 90 ? 'pass' : 'warning'}">${metrics.passRate.toFixed(1)}%</div>
      </div>
      
      <div class="summary-card">
        <h3>Code Coverage</h3>
        <div class="metric-value ${metrics.coverageStatus === 'Pass' ? 'pass' : 'fail'}">${results.summary.coverage.toFixed(1)}%</div>
        <div>Threshold: ${config.coverageThreshold}%</div>
      </div>
      
      <div class="summary-card">
        <h3>Risk Assessment</h3>
        <div class="metric-value ${results.kpis.riskScore === 'Low' ? 'pass' : (results.kpis.riskScore === 'Medium' ? 'warning' : 'fail')}">${results.kpis.riskScore}</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h2>Failed Tests</h2>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Type</th>
          <th>Framework</th>
          <th>Error Message</th>
        </tr>
      </thead>
      <tbody>
        ${results.failedTests.map(test => `
          <tr>
            <td>${test.name}</td>
            <td>${test.type}</td>
            <td>${test.framework}</td>
            <td class="fail">${test.message}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>Coverage by Test Type</h2>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Total</th>
          <th>Passed</th>
          <th>Failed</th>
          <th>Skipped</th>
          <th>Coverage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(results.testTypes).map(([type, data]) => `
          <tr>
            <td>${type}</td>
            <td>${data.total}</td>
            <td class="pass">${data.passed}</td>
            <td class="${data.failed > 0 ? 'fail' : ''}">${data.failed}</td>
            <td class="${data.skipped > 0 ? 'warning' : ''}">${data.skipped}</td>
            <td class="${data.coverage !== null ? (data.coverage >= config.coverageThreshold ? 'pass' : 'fail') : ''}">
              ${data.coverage !== null ? data.coverage.toFixed(1) + '%' : 'N/A'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>Framework Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Framework</th>
          <th>Total</th>
          <th>Passed</th>
          <th>Failed</th>
          <th>Skipped</th>
          <th>Duration (s)</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(results.frameworks).map(([framework, data]) => `
          <tr>
            <td>${framework}</td>
            <td>${data.total}</td>
            <td class="pass">${data.passed}</td>
            <td class="${data.failed > 0 ? 'fail' : ''}">${data.failed}</td>
            <td class="${data.skipped > 0 ? 'warning' : ''}">${data.skipped}</td>
            <td>${data.duration.toFixed(1)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>Test Debt</h2>
    <div class="summary-card">
      <h3>Maintenance Index</h3>
      <div class="metric-value ${results.kpis.maintenanceIndex > 70 ? 'pass' : 'warning'}">${results.kpis.maintenanceIndex}/100</div>
      <p>Issues to address: ${results.kpis.testDebt}</p>
      <p>Risk factors: ${metrics.riskFactor.lowCoverageAreas.length > 0 ? 
        'Low coverage in ' + metrics.riskFactor.lowCoverageAreas.join(', ') : 
        'No significant risk factors'}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  // In a real implementation, this would write to the file system
  console.log('Report generated successfully');
  
  return html;
}

// Main function to run the report generation
function main() {
  try {
    // Ensure results directory exists
    if (!fs.existsSync(config.resultsDir)) {
      fs.mkdirSync(config.resultsDir, { recursive: true });
    }
    
    // Collect and process results
    const results = collectTestResults();
    const metrics = calculateMetrics(results);
    const reportHtml = generateReport(results, metrics);
    
    // Write the report to file
    fs.writeFileSync(config.outputFile, reportHtml);
    
    console.log('Report generated successfully at:', config.outputFile);
    console.log(`Summary: ${results.summary.passed}/${results.summary.total} tests passed (${metrics.passRate.toFixed(1)}%)`);
    console.log(`Coverage: ${results.summary.coverage.toFixed(1)}% (Threshold: ${config.coverageThreshold}%)`);
    console.log(`Risk Assessment: ${results.kpis.riskScore}`);
    
    // Return exit code based on test results
    // Non-zero exit code if we have failures or coverage is below threshold
    const exitCode = (results.summary.failed > 0 || results.summary.coverage < config.coverageThreshold) ? 1 : 0;
    process.exit(exitCode);
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { collectTestResults, calculateMetrics, generateReport, main };
