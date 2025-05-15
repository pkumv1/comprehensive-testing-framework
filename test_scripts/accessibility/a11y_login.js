const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Login Page Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com/login');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Start with focus on the page body
    await page.focus('body');
    
    // Press Tab to move focus to first focusable element (should be username)
    await page.keyboard.press('Tab');
    const usernameHasFocus = await page.evaluate(() => {
      return document.activeElement.id === 'username';
    });
    expect(usernameHasFocus).toBe(true);
    
    // Fill username with keyboard
    await page.keyboard.type('user@example.com');
    
    // Tab to password field
    await page.keyboard.press('Tab');
    const passwordHasFocus = await page.evaluate(() => {
      return document.activeElement.id === 'password';
    });
    expect(passwordHasFocus).toBe(true);
    
    // Fill password with keyboard
    await page.keyboard.type('securepassword123');
    
    // Tab to submit button
    await page.keyboard.press('Tab');
    const submitHasFocus = await page.evaluate(() => {
      return document.activeElement.tagName === 'BUTTON' && 
             document.activeElement.type === 'submit';
    });
    expect(submitHasFocus).toBe(true);
    
    // Submit form with Enter key
    await page.keyboard.press('Enter');
    
    // Check if navigation happened (form submitted)
    await page.waitForURL(/.*\/dashboard/);
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check form has appropriate role
    const formRole = await page.$eval('form', form => form.getAttribute('role'));
    expect(formRole).toBe('form');
    
    // Check username field has label
    const usernameLabel = await page.$eval('label[for="username"]', label => label.textContent);
    expect(usernameLabel).toBeTruthy();
    
    // Check password field has label
    const passwordLabel = await page.$eval('label[for="password"]', label => label.textContent);
    expect(passwordLabel).toBeTruthy();
    
    // Check error messages have appropriate aria attributes
    await page.locator('#username').click();
    await page.keyboard.press('Tab'); // Trigger validation
    
    const errorHasAriaAttributes = await page.$eval('#username-error', error => {
      return error.getAttribute('role') === 'alert' && 
             error.getAttribute('aria-live') === 'assertive';
    });
    expect(errorHasAriaAttributes).toBe(true);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This would normally use a tool like axe-core to check contrast
    // For demonstration purposes, we'll check a few key elements
    
    // Check button text contrast
    const buttonContrast = await page.$eval('button[type="submit"]', button => {
      const buttonStyle = window.getComputedStyle(button);
      // This is a simplification - in a real test we would use a color contrast algorithm
      const buttonColor = buttonStyle.color;
      const buttonBg = buttonStyle.backgroundColor;
      return { color: buttonColor, bg: buttonBg };
    });
    
    // In a real test, we would calculate the contrast ratio
    // For now, just verify we got color values
    expect(buttonContrast.color).toBeTruthy();
    expect(buttonContrast.bg).toBeTruthy();
    
    // A more realistic approach would use the axe-core contrast check
    const contrastResults = await new AxeBuilder({ page })
      .include('button[type="submit"]')
      .options({ runOnly: ['color-contrast'] })
      .analyze();
    
    expect(contrastResults.violations).toEqual([]);
  });
});
