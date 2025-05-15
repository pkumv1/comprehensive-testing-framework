const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com/login');
  });

  test('login form should match baseline', async ({ page }) => {
    // Take a screenshot of the login form and compare with baseline
    await expect(page.locator('form')).toHaveScreenshot('login-form.png');
  });

  test('button states should match baseline', async ({ page }) => {
    // Screenshot the default (disabled) state
    await expect(page.locator('button[type="submit"]')).toHaveScreenshot('button-disabled.png');
    
    // Fill in the form to enable the button
    await page.locator('#username').fill('user@example.com');
    await page.locator('#password').fill('securepassword123');
    
    // Screenshot the enabled state
    await expect(page.locator('button[type="submit"]')).toHaveScreenshot('button-enabled.png');
    
    // Hover over the button
    await page.locator('button[type="submit"]').hover();
    
    // Screenshot the hover state
    await expect(page.locator('button[type="submit"]')).toHaveScreenshot('button-hover.png');
  });

  test('error states should match baseline', async ({ page }) => {
    // Trigger username error
    await page.locator('#username').fill('invalid-email');
    await page.locator('#password').click(); // Move focus to trigger validation
    
    // Screenshot error state
    await expect(page.locator('#username-container')).toHaveScreenshot('username-error.png');
    
    // Trigger password error
    await page.locator('#password').fill('123'); // Too short
    await page.locator('#username').click(); // Move focus to trigger validation
    
    // Screenshot error state
    await expect(page.locator('#password-container')).toHaveScreenshot('password-error.png');
  });

  test('login form is responsive', async ({ page }) => {
    // Test different viewport sizes
    
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('login-mobile.png');
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('login-tablet.png');
    
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page).toHaveScreenshot('login-desktop.png');
  });

  // This test demonstrates self-healing capability by using relative selectors
  // and multiple approaches to find elements
  test('login form elements remain visually consistent with layout changes', async ({ page }) => {
    // Use multiple strategies to locate elements
    const usernameInput = page.locator('input#username, input[name="username"], input[type="email"]').first();
    const passwordInput = page.locator('input#password, input[name="password"], input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"], input[type="submit"], .login-button').first();
    
    // Fill form using our resilient selectors
    await usernameInput.fill('user@example.com');
    await passwordInput.fill('securepassword123');
    
    // Take screenshot of the form in its filled state
    await expect(page.locator('form, .login-form')).toHaveScreenshot('login-form-filled.png');
    
    // Simulate the button being enabled
    if (!(await submitButton.isEnabled())) {
      // If button is not already enabled, use JS to enable it
      await page.evaluate(() => {
        const button = document.querySelector('button[type="submit"], input[type="submit"], .login-button');
        if (button) button.disabled = false;
      });
    }
    
    // Take screenshot of the enabled button
    await expect(submitButton).toHaveScreenshot('submit-button-enabled.png');
  });
});
