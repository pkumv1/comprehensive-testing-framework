/**
 * Self-Healing Test Demo
 * 
 * This script demonstrates the self-healing capabilities of the test framework
 * by simulating changes to the application's UI and showing how the tests adapt.
 */

const { chromium } = require('@playwright/test');
const { selfHealingFill, selfHealingClick, selfHealingExists } = require('../test_scripts/common/selfHealing');
const { LoginPageElements } = require('../test_scripts/common/elementMap');

/**
 * Demonstrate self-healing capabilities
 */
async function demonstrateSelfHealing() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('\n===============================================');
    console.log('🔄 SELF-HEALING TEST DEMONSTRATION');
    console.log('===============================================\n');
    
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
          </style>
          <script>
            function validateForm() {
              const username = document.getElementById('username').value;
              const password = document.getElementById('password').value;
              const usernameError = document.getElementById('username-error');
              const passwordError = document.getElementById('password-error');
              const submitButton = document.querySelector('button[type="submit"]');
              
              // Validate username
              if (!username) {
                usernameError.textContent = 'Username is required';
                usernameError.style.display = 'block';
              } else if (!username.includes('@')) {
                usernameError.textContent = 'Enter a valid email address';
                usernameError.style.display = 'block';
              } else {
                usernameError.style.display = 'none';
              }
              
              // Validate password
              if (!password) {
                passwordError.textContent = 'Password is required';
                passwordError.style.display = 'block';
              } else if (password.length < 8) {
                passwordError.textContent = 'Password must be at least 8 characters';
                passwordError.style.display = 'block';
              } else {
                passwordError.style.display = 'none';
              }
              
              // Enable/disable submit button
              submitButton.disabled = !username || !username.includes('@') || !password || password.length < 8;
            }
            
            function submitForm(event) {
              event.preventDefault();
              const username = document.getElementById('username').value;
              const password = document.getElementById('password').value;
              
              // Simulate API call
              console.log('Login attempt:', { username, password });
              
              // Redirect to dashboard (simulate successful login)
              window.location.href = '#dashboard';
              document.getElementById('login-form').style.display = 'none';
              document.getElementById('dashboard').style.display = 'block';
            }
          </script>
        </head>
        <body>
          <form id="login-form" onsubmit="submitForm(event)">
            <h2>Login</h2>
            <div class="form-group">
              <label for="username">Username</label>
              <input type="email" id="username" name="username" placeholder="Email address" onkeyup="validateForm()" data-testid="username-input">
              <div id="username-error" class="error"></div>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Password" onkeyup="validateForm()" data-testid="password-input">
              <div id="password-error" class="error"></div>
            </div>
            <div class="form-group">
              <button type="submit" disabled data-testid="login-submit">Sign In</button>
            </div>
          </form>
          
          <div id="dashboard" style="display: none;">
            <h2>Dashboard</h2>
            <p class="welcome-message">Welcome, User!</p>
            <button class="logout">Logout</button>
          </div>
        </body>
      </html>
    `);
    
    console.log('👉 Step 1: Using self-healing to interact with the login form');
    console.log('----------------------------------------');
    
    // Use self-healing utilities to interact with the form
    await selfHealingFill(page, LoginPageElements.usernameField, 'user@example.com');
    await selfHealingFill(page, LoginPageElements.passwordField, 'secure-password-123');
    await page.waitForTimeout(500); // Wait for validation
    await selfHealingClick(page, LoginPageElements.submitButton);
    
    // Verify successful login
    const dashboardVisible = await page.locator('#dashboard').isVisible();
    console.log(`Login successful: ${dashboardVisible ? 'Yes ✅' : 'No ❌'}`);
    
    console.log('\n👉 Step 2: Simulating UI changes to see self-healing in action');
    console.log('----------------------------------------');
    
    // Reset and modify the UI to simulate changes
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
          </style>
          <script>
            function validateForm() {
              const email = document.getElementById('email').value;
              const password = document.getElementById('user-password').value;
              const emailError = document.getElementById('email-error');
              const passwordError = document.getElementById('password-error');
              const loginButton = document.querySelector('.login-button');
              
              // Validate email
              if (!email) {
                emailError.textContent = 'Email is required';
                emailError.style.display = 'block';
              } else if (!email.includes('@')) {
                emailError.textContent = 'Enter a valid email address';
                emailError.style.display = 'block';
              } else {
                emailError.style.display = 'none';
              }
              
              // Validate password
              if (!password) {
                passwordError.textContent = 'Password is required';
                passwordError.style.display = 'block';
              } else if (password.length < 8) {
                passwordError.textContent = 'Password must be at least 8 characters';
                passwordError.style.display = 'block';
              } else {
                passwordError.style.display = 'none';
              }
              
              // Enable/disable login button
              loginButton.disabled = !email || !email.includes('@') || !password || password.length < 8;
            }
            
            function submitForm(event) {
              event.preventDefault();
              const email = document.getElementById('email').value;
              const password = document.getElementById('user-password').value;
              
              // Simulate API call
              console.log('Login attempt:', { email, password });
              
              // Redirect to dashboard (simulate successful login)
              window.location.href = '#dashboard';
              document.getElementById('auth-form').style.display = 'none';
              document.getElementById('user-dashboard').style.display = 'block';
            }
          </script>
        </head>
        <body>
          <!-- Note: IDs and classes have changed! -->
          <form id="auth-form" class="login-form" onsubmit="submitForm(event)">
            <h2>Sign in to your account</h2>
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" onkeyup="validateForm()">
              <div id="email-error" class="error"></div>
            </div>
            <div class="form-group">
              <label for="user-password">Password</label>
              <input type="password" id="user-password" name="password" placeholder="Enter your password" onkeyup="validateForm()">
              <div id="password-error" class="error"></div>
            </div>
            <div class="form-group">
              <button type="submit" class="login-button" disabled>Login</button>
            </div>
          </form>
          
          <div id="user-dashboard" style="display: none;">
            <h2>User Dashboard</h2>
            <p>Welcome back! You are now signed in.</p>
            <button class="sign-out-button">Sign Out</button>
          </div>
        </body>
      </html>
    `);
    
    console.log('UI has been changed! 🔄');
    console.log('- Username field → Email field');
    console.log('- Password field ID changed');
    console.log('- Submit button class changed');
    console.log('- Form ID changed');
    console.log('\nWill our self-healing tests still work?\n');
    
    // Try with self-healing utilities again
    await selfHealingFill(page, LoginPageElements.usernameField, 'user@example.com');
    await selfHealingFill(page, LoginPageElements.passwordField, 'secure-password-123');
    await page.waitForTimeout(500); // Wait for validation
    await selfHealingClick(page, LoginPageElements.submitButton);
    
    // Verify successful login despite UI changes
    const dashboardVisible2 = await page.locator('#user-dashboard').isVisible();
    console.log(`Login successful after UI changes: ${dashboardVisible2 ? 'Yes ✅' : 'No ❌'}`);
    
    if (dashboardVisible2) {
      console.log('\n🎉 Success! The self-healing tests adapted to the UI changes!');
      console.log('This demonstrates how the framework can handle:');
      console.log('- Changed element IDs');
      console.log('- Changed element classes');
      console.log('- Changed text content');
      console.log('- Modified DOM structure');
    } else {
      console.log('\n❌ The test failed to adapt to the UI changes.');
    }
    
    console.log('\n===============================================');
  } catch (error) {
    console.error('Error during self-healing demonstration:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  demonstrateSelfHealing()
    .catch(error => {
      console.error('Demonstration failed:', error);
      process.exit(1);
    });
}

module.exports = { demonstrateSelfHealing };
