const { test, expect } = require('@playwright/test');

test.describe('Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com/login');
  });

  test('login form uses HTTPS', async ({ page }) => {
    const url = page.url();
    expect(url).toMatch(/^https:\/\//i);
  });

  test('login form has proper security headers', async ({ page }) => {
    // Get response headers
    const response = await page.goto('https://example.com/login');
    const headers = response.headers();
    
    // Check critical security headers
    expect(headers['content-security-policy']).toBeTruthy();
    expect(headers['x-xss-protection']).toBeTruthy();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['x-frame-options']).toBeTruthy();
  });

  test('login form prevents XSS attacks', async ({ page }) => {
    // Try to inject script via form fields
    const scriptPayload = '<script>alert("XSS")</script>';
    
    await page.locator('#username').fill(scriptPayload);
    await page.locator('#password').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Check if script was executed by looking for alert dialogs
    const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    
    // No dialog should appear (script shouldn't execute)
    expect(dialog).toBeNull();
    
    // Alternatively, check if the script content is properly encoded in the output
    const pageContent = await page.content();
    expect(pageContent).not.toContain('alert("XSS")');
  });

  test('password field masks input', async ({ page }) => {
    const passwordField = page.locator('#password');
    
    // Check that password field has type="password"
    const inputType = await passwordField.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('login form is not vulnerable to SQL injection', async ({ request }) => {
    // Try common SQL injection payloads
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "' OR '1'='1' --",
      "admin' --",
      "'; DROP TABLE users; --"
    ];
    
    for (const payload of sqlInjectionPayloads) {
      const response = await request.post('https://example.com/api/login', {
        data: {
          username: payload,
          password: payload
        }
      });
      
      // Should not be successful login
      expect(response.status()).not.toBe(200);
      
      const body = await response.json();
      expect(body.success).not.toBe(true);
      expect(body.token).toBeFalsy();
    }
  });

  test('login form prevents CSRF attacks', async ({ page }) => {
    // Check if the form has a CSRF token
    const hasCsrfToken = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return false;
      
      // Look for CSRF token in a hidden input
      const csrfInput = form.querySelector('input[name="csrf_token"], input[name="_token"], input[name="__csrf"]');
      return !!csrfInput;
    });
    
    expect(hasCsrfToken).toBe(true);
    
    // Alternatively, check if a CSRF cookie is present
    const cookies = await page.context().cookies();
    const hasCsrfCookie = cookies.some(cookie => 
      cookie.name.toLowerCase().includes('csrf') || cookie.name.toLowerCase().includes('xsrf')
    );
    
    // Either token or cookie should be present
    expect(hasCsrfToken || hasCsrfCookie).toBe(true);
  });

  test('login form prevents brute force attacks', async ({ request }) => {
    // Try multiple failed logins
    const maxAttempts = 10;
    let rateLimited = false;
    
    for (let i = 0; i < maxAttempts; i++) {
      const response = await request.post('https://example.com/api/login', {
        data: {
          username: 'user@example.com',
          password: `wrongpassword${i}`
        }
      });
      
      // If we get rate limited, record it
      if (response.status() === 429) {
        rateLimited = true;
        break;
      }
      
      // Allow a short delay between requests to avoid network issues
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Should be rate limited after multiple failed attempts
    expect(rateLimited).toBe(true);
  });
});
