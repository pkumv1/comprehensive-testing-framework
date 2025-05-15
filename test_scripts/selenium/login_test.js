const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Login Form Tests', function() {
  let driver;

  before(async function() {
    // Set up the WebDriver instance
    driver = await new Builder().forBrowser('chrome').build();
  });

  beforeEach(async function() {
    // Navigate to login page before each test
    await driver.get('https://example.com/login');
  });

  after(async function() {
    // Close the browser after all tests
    await driver.quit();
  });

  it('validates username field', async function() {
    const usernameField = driver.findElement(By.id('username'));
    const errorMessage = driver.findElement(By.id('username-error'));
    
    // Test empty field validation
    await usernameField.click();
    await driver.findElement(By.id('password')).click(); // Move focus away
    let isErrorDisplayed = await errorMessage.isDisplayed();
    assert.strictEqual(isErrorDisplayed, true, 'Error should be displayed for empty username');
    
    // Test invalid email format
    await usernameField.clear();
    await usernameField.sendKeys('invalid-email');
    await driver.findElement(By.id('password')).click(); // Move focus away
    isErrorDisplayed = await errorMessage.isDisplayed();
    assert.strictEqual(isErrorDisplayed, true, 'Error should be displayed for invalid email');
    
    // Test valid email format
    await usernameField.clear();
    await usernameField.sendKeys('user@example.com');
    await driver.findElement(By.id('password')).click(); // Move focus away
    // Wait for error to disappear
    await driver.wait(async function() {
      return !(await errorMessage.isDisplayed());
    }, 1000).catch(() => {});
    isErrorDisplayed = await errorMessage.isDisplayed().catch(() => false);
    assert.strictEqual(isErrorDisplayed, false, 'Error should not be displayed for valid email');
  });

  it('validates password field', async function() {
    const passwordField = driver.findElement(By.id('password'));
    const errorMessage = driver.findElement(By.id('password-error'));
    
    // Test empty field validation
    await passwordField.click();
    await driver.findElement(By.id('username')).click(); // Move focus away
    let isErrorDisplayed = await errorMessage.isDisplayed();
    assert.strictEqual(isErrorDisplayed, true, 'Error should be displayed for empty password');
    
    // Test password too short
    await passwordField.clear();
    await passwordField.sendKeys('123');
    await driver.findElement(By.id('username')).click(); // Move focus away
    isErrorDisplayed = await errorMessage.isDisplayed();
    assert.strictEqual(isErrorDisplayed, true, 'Error should be displayed for short password');
    
    // Test valid password
    await passwordField.clear();
    await passwordField.sendKeys('securepassword123');
    await driver.findElement(By.id('username')).click(); // Move focus away
    // Wait for error to disappear
    await driver.wait(async function() {
      return !(await errorMessage.isDisplayed());
    }, 1000).catch(() => {});
    isErrorDisplayed = await errorMessage.isDisplayed().catch(() => false);
    assert.strictEqual(isErrorDisplayed, false, 'Error should not be displayed for valid password');
  });

  it('disables submit button until form is valid', async function() {
    const submitButton = driver.findElement(By.css('button[type="submit"]'));
    const usernameField = driver.findElement(By.id('username'));
    const passwordField = driver.findElement(By.id('password'));
    
    // Initially button should be disabled
    let isButtonEnabled = await submitButton.isEnabled();
    assert.strictEqual(isButtonEnabled, false, 'Button should be disabled initially');
    
    // Fill only username
    await usernameField.sendKeys('user@example.com');
    isButtonEnabled = await submitButton.isEnabled();
    assert.strictEqual(isButtonEnabled, false, 'Button should be disabled with only username filled');
    
    // Fill only password
    await usernameField.clear();
    await passwordField.sendKeys('securepassword123');
    isButtonEnabled = await submitButton.isEnabled();
    assert.strictEqual(isButtonEnabled, false, 'Button should be disabled with only password filled');
    
    // Fill both fields with valid values
    await usernameField.sendKeys('user@example.com');
    // Wait for button to become enabled
    await driver.wait(until.elementIsEnabled(submitButton), 1000);
    isButtonEnabled = await submitButton.isEnabled();
    assert.strictEqual(isButtonEnabled, true, 'Button should be enabled with valid form');
  });

  // Additional integration tests would go here
});
