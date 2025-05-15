/**
 * Visual Regression Testing Demo
 * 
 * This script demonstrates the visual regression testing capabilities
 * by capturing screenshots and comparing them against baselines.
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

// Configuration
const config = {
  outputDir: path.join(__dirname, '../results/visual-demo'),
  baselineDir: path.join(__dirname, '../results/visual-demo/baseline'),
  diffDir: path.join(__dirname, '../results/visual-demo/diff'),
  currentDir: path.join(__dirname, '../results/visual-demo/current'),
  threshold: 0.1, // Threshold for pixel difference (0-1)
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ]
};

// Ensure directories exist
[config.outputDir, config.baselineDir, config.diffDir, config.currentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Compare two PNG images and generate a diff
 * @param {string} img1Path - Path to first image
 * @param {string} img2Path - Path to second image
 * @param {string} diffPath - Path to output diff image
 * @returns {Object} - Comparison results
 */
function compareImages(img1Path, img2Path, diffPath) {
  // Read images
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));
  
  // Create output image
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  
  // Compare images
  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: config.threshold
  });
  
  // Calculate difference percentage
  const diffPercentage = (numDiffPixels / (width * height)) * 100;
  
  // Save diff image
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  
  return {
    diffPixels: numDiffPixels,
    diffPercentage,
    dimensions: { width, height },
    totalPixels: width * height
  };
}

/**
 * Demonstrate visual regression testing
 */
async function demonstrateVisualTesting() {
  // Launch browser
  const browser = await chromium.launch();
  
  try {
    console.log('\n===============================================');
    console.log('🖼️  VISUAL REGRESSION TESTING DEMONSTRATION');
    console.log('===============================================\n');
    
    console.log('🔍 Testing login form appearance across different viewport sizes');
    console.log('----------------------------------------');
    
    const results = [];
    
    // Test each viewport size
    for (const viewport of config.viewports) {
      console.log(`\nTesting ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
      
      // Create a new browser context for this viewport
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      
      const page = await context.newPage();
      
      // Create a simple login form for demonstration
      await page.setContent(`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              form { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
              .form-group { margin-bottom: 15px; }
              label { display: block; margin-bottom: 5px; }
              input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
              button { padding: 10px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
              button:disabled { background-color: #cccccc; cursor: not-allowed; }
              .error { color: red; font-size: 0.8rem; margin-top: 5px; display: none; }
              
              /* Responsive adjustments */
              @media (max-width: 768px) {
                form { padding: 15px; }
              }
              @media (max-width: 480px) {
                form { padding: 10px; }
                .form-group { margin-bottom: 10px; }
                button { width: 100%; }
              }
            </style>
          </head>
          <body>
            <form id="login-form">
              <h2>Login</h2>
              <div class="form-group">
                <label for="username">Username</label>
                <input type="email" id="username" name="username" placeholder="Email address">
                <div id="username-error" class="error"></div>
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Password">
                <div id="password-error" class="error"></div>
              </div>
              <div class="form-group">
                <button type="submit">Sign In</button>
              </div>
            </form>
          </body>
        </html>
      `);
      
      // Take a screenshot
      const screenshotPath = path.join(config.currentDir, `login-${viewport.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot captured: ${screenshotPath}`);
      
      // First run: create baseline if it doesn't exist
      const baselinePath = path.join(config.baselineDir, `login-${viewport.name}.png`);
      if (!fs.existsSync(baselinePath)) {
        fs.copyFileSync(screenshotPath, baselinePath);
        console.log(`Baseline created: ${baselinePath}`);
        results.push({
          viewport: viewport.name,
          status: 'baseline_created',
          diffPercentage: 0
        });
        continue;
      }
      
      // Compare with baseline
      const diffPath = path.join(config.diffDir, `login-${viewport.name}-diff.png`);
      console.log('Comparing with baseline...');
      
      const comparison = compareImages(baselinePath, screenshotPath, diffPath);
      
      // Add to results
      results.push({
        viewport: viewport.name,
        status: comparison.diffPercentage < 1 ? 'passed' : 'failed',
        diffPercentage: comparison.diffPercentage,
        diffPixels: comparison.diffPixels,
        totalPixels: comparison.totalPixels
      });
      
      console.log(`Diff: ${comparison.diffPercentage.toFixed(2)}% (${comparison.diffPixels} pixels)`);
      console.log(`Status: ${comparison.diffPercentage < 1 ? '✅ PASSED' : '❌ FAILED'}`);
      
      // Close context
      await context.close();
    }
    
    // Now introduce a UI change and detect it
    console.log('\n\n👉 Introducing a UI change to demonstrate visual diff detection');
    console.log('----------------------------------------');
    
    // Create a new browser context
    const modifiedContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    
    const modifiedPage = await modifiedContext.newPage();
    
    // Create a modified login form (different button color and layout)
    await modifiedPage.setContent(`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            form { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { padding: 10px 15px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:disabled { background-color: #cccccc; cursor: not-allowed; }
            .error { color: red; font-size: 0.8rem; margin-top: 5px; display: none; }
            
            /* Modified styling */
            h2 { color: #2196F3; }
            input:focus { border-color: #2196F3; outline: none; }
          </style>
        </head>
        <body>
          <form id="login-form">
            <h2>Sign In</h2>
            <div class="form-group">
              <label for="username">Email</label>
              <input type="email" id="username" name="username" placeholder="Email address">
              <div id="username-error" class="error"></div>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Password">
              <div id="password-error" class="error"></div>
            </div>
            <div class="form-group">
              <button type="submit">Login</button>
            </div>
          </form>
        </body>
      </html>
    `);
    
    // Take a screenshot of the modified UI
    const modifiedScreenshotPath = path.join(config.currentDir, 'login-desktop-modified.png');
    await modifiedPage.screenshot({ path: modifiedScreenshotPath, fullPage: true });
    
    // Compare with baseline
    const baselinePath = path.join(config.baselineDir, 'login-desktop.png');
    const diffPath = path.join(config.diffDir, 'login-desktop-modified-diff.png');
    
    const comparison = compareImages(baselinePath, modifiedScreenshotPath, diffPath);
    
    console.log(`Modified UI captured: ${modifiedScreenshotPath}`);
    console.log(`Comparing with baseline...`);
    console.log(`Diff: ${comparison.diffPercentage.toFixed(2)}% (${comparison.diffPixels} pixels)`);
    console.log(`Status: ${comparison.diffPercentage < 1 ? '✅ PASSED' : '❌ FAILED (Change detected)'}`);
    
    // UI changes we made:
    console.log('\n🔍 UI changes detected:');
    console.log('- Button color changed from green to blue');
    console.log('- Heading changed from "Login" to "Sign In"');
    console.log('- Heading color changed to blue');
    console.log('- Label changed from "Username" to "Email"');
    
    // Close modified context
    await modifiedContext.close();
    
    // Write summary report
    const summaryPath = path.join(config.outputDir, 'visual-test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results,
      modifiedUiTest: {
        viewport: 'desktop',
        status: comparison.diffPercentage < 1 ? 'passed' : 'failed',
        diffPercentage: comparison.diffPercentage,
        diffPixels: comparison.diffPixels,
        totalPixels: comparison.totalPixels
      }
    }, null, 2));
    
    console.log(`\nSummary report written to: ${summaryPath}`);
    console.log('\n===============================================');
  } catch (error) {
    console.error('Error during visual testing demonstration:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  demonstrateVisualTesting()
    .catch(error => {
      console.error('Demonstration failed:', error);
      process.exit(1);
    });
}

module.exports = { demonstrateVisualTesting, compareImages };
