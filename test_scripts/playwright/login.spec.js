// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Login Form Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com/login');
  });

  test('should validate username field', async ({ page }) => {
    const usernameField = page.locator('#username');
    const errorMessage = page.locator('#username-error');
    
    // Test empty field validation
    await usernameField.focus();
    await page.keyboard.press('Tab'); // Move focus away to trigger validation
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('required');
    
    // Test invalid email format
    await usernameField.fill('invalid-email');
    await page.keyboard.press('Tab'); // Move focus away
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('valid email');
    
    // Test valid email format
    await usernameField.fill('user@example.com');
    await page.keyboard.press('Tab'); // Move focus away
    await expect(errorMessage).not.toBeVisible();
  });

  test('should validate password field', async ({ page }) => {
    const passwordField = page.locator('#password');
    const errorMessage = page.locator('#password-error');
    
    // Test empty field validation
    await passwordField.focus();
    await page.keyboard.press('Tab'); // Move focus away
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('required');
    
    // Test password too short
    await passwordField.fill('123');
    await page.keyboard.press('Tab'); // Move focus away
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('at least');
    
    // Test valid password
    await passwordField.fill('securepassword123');
    await page.keyboard.press('Tab'); // Move focus away
    await expect(errorMessage).not.toBeVisible();
  });

  test('submit button should be disabled until form is valid', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');
    
    // Initially button should be disabled
    await expect(submitButton).toBeDisabled();
    
    // Fill only username
    await usernameField.fill('user@example.com');
    await expect(submitButton).toBeDisabled();
    
    // Fill only password
    await usernameField.fill('');
    await passwordField.fill('securepassword123');
    await expect(submitButton).toBeDisabled();
    
    // Fill both fields with valid values
    await usernameField.fill('user@example.com');
    await passwordField.fill('securepassword123');
    await expect(submitButton).toBeEnabled();
  });

  test('successful login should redirect to dashboard', async ({ page }) => {
    // Setup request interception to mock successful login
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, token: 'fake-token' })
      });
    });
    
    // Fill form and submit
    await page.locator('#username').fill('user@example.com');
    await page.locator('#password').fill('securepassword123');
    await page.locator('button[type="submit"]').click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('failed login should show error message', async ({ page }) => {
    // Setup request interception to mock failed login
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      });
    });
    
    // Fill form and submit
    await page.locator('#username').fill('user@example.com');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // Should show error message
    const errorMessage = page.locator('.login-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid credentials');
    await expect(page).toHaveURL(/.*\/login/); // Should remain on login page
  });
});
