const puppeteer = require('puppeteer');

describe('Login Form Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('https://example.com/login');
    
    // Mock the fetch/XHR API to handle login requests
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/login')) {
        const postData = request.postData();
        if (postData && postData.includes('user@example.com') && postData.includes('correctpassword')) {
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, token: 'fake-token' })
          });
        } else {
          request.respond({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, message: 'Invalid credentials' })
          });
        }
      } else {
        request.continue();
      }
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('username field validation', async () => {
    // Test empty field
    await page.click('#username');
    await page.click('#password'); // Move focus away
    let errorVisible = await page.evaluate(() => {
      const error = document.querySelector('#username-error');
      return error && window.getComputedStyle(error).display !== 'none';
    });
    expect(errorVisible).toBe(true);
    
    // Test invalid email
    await page.type('#username', 'invalid-email');
    await page.click('#password'); // Move focus away
    errorVisible = await page.evaluate(() => {
      const error = document.querySelector('#username-error');
      return error && window.getComputedStyle(error).display !== 'none';
    });
    expect(errorVisible).toBe(true);
    
    // Test valid email
    await page.evaluate(() => document.querySelector('#username').value = '');
    await page.type('#username', 'user@example.com');
    await page.click('#password'); // Move focus away
    await page.waitForTimeout(300); // Allow time for validation
    errorVisible = await page.evaluate(() => {
      const error = document.querySelector('#username-error');
      return error && window.getComputedStyle(error).display !== 'none';
    });
    expect(errorVisible).toBe(false);
  });

  test('password field validation', async () => {
    // Test empty field
    await page.click('#password');
    await page.click('#username'); // Move focus away
    let errorVisible = await page.evaluate(() => {
      const error = document.querySelector('#password-error');
      return error && window.getComputedStyle(error).display !== 'none';
    });
    expect(errorVisible).toBe(true);
    
    // Test password too short
    await page.type('#password', '123');
    await page.click('#username'); // Move focus away
    errorVisible = await page.evaluate(() => {
      const error = document.querySelector('#password-error');
      return error && window.getComputedStyle(error).display !== 'none';
    });
    expect(errorVisible).toBe(true);
    
    // Test valid password
    await page.evaluate(() => document.querySelector('#password').value = '');
    await page.type('#password', 'securepassword123');
    await page.click('#username'); // Move focus away
    await page.waitForTimeout(300); // Allow time for validation
    errorVisible = await page.evaluate(() => {
      const error = document.querySelector('#password-error');
      return error && window.getComputedStyle(error).display !== 'none';
    });
    expect(errorVisible).toBe(false);
  });

  test('successful login redirects to dashboard', async () => {
    await page.type('#username', 'user@example.com');
    await page.type('#password', 'correctpassword');
    
    // Navigation should happen when form is submitted
    const navigationPromise = page.waitForNavigation();
    await page.click('button[type="submit"]');
    await navigationPromise;
    
    // Check if redirected to dashboard
    const url = page.url();
    expect(url).toMatch(/dashboard/);
  });

  test('failed login shows error message', async () => {
    await page.type('#username', 'user@example.com');
    await page.type('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForSelector('.login-error', { visible: true });
    
    // Check if error message is shown
    const errorMessage = await page.$eval('.login-error', el => el.textContent);
    expect(errorMessage).toContain('Invalid credentials');
    
    // Check if still on login page
    const url = page.url();
    expect(url).toMatch(/login/);
  });
});
