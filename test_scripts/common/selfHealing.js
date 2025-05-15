/**
 * Self-Healing Test Utilities
 * 
 * This module provides utilities for creating self-healing tests that can
 * adapt to minor UI changes and reduce maintenance.
 */

/**
 * Get an element with multiple selector strategies
 * This is a core self-healing approach - try multiple selectors
 * to find an element when the preferred one fails
 * 
 * @param {Object} page - Playwright page object
 * @param {Object} selectors - Object with selector strategies in priority order
 * @param {number} timeout - Maximum time to wait for any selector
 * @returns {Promise<Object>} - Playwright element handle
 */
async function getSelfHealingElement(page, selectors, timeout = 5000) {
  // Try selectors in order of preference
  const strategies = Object.entries(selectors);
  
  for (let i = 0; i < strategies.length; i++) {
    const [strategy, selector] = strategies[i];
    try {
      // Try to find element with current strategy
      let element;
      
      switch (strategy) {
        case 'testId':
          element = page.locator(`[data-testid="${selector}"]`);
          break;
        case 'id':
          element = page.locator(`#${selector}`);
          break;
        case 'css':
          element = page.locator(selector);
          break;
        case 'text':
          element = page.getByText(selector, { exact: false });
          break;
        case 'role':
          element = page.getByRole(selector.role, { name: selector.name });
          break;
        case 'label':
          element = page.getByLabel(selector);
          break;
        case 'placeholder':
          element = page.getByPlaceholder(selector);
          break;
        case 'xpath':
          element = page.locator(`xpath=${selector}`);
          break;
        default:
          continue;
      }
      
      // Wait for element to be visible with reduced timeout
      const reducedTimeout = Math.min(timeout, 2000);
      await element.waitFor({ state: 'visible', timeout: reducedTimeout });
      
      // If we found it, return the element
      console.log(`✅ Found element using ${strategy} strategy`);
      return element;
    } catch (error) {
      // Log the failure and try next strategy
      console.log(`❌ Failed to find element using ${strategy} strategy: ${error.message}`);
      if (i === strategies.length - 1) {
        // If this was the last strategy, rethrow the error
        throw new Error(`Failed to find element with any strategy: ${Object.keys(selectors).join(', ')}`);
      }
    }
  }
}

/**
 * Fill form field with self-healing capability
 * 
 * @param {Object} page - Playwright page object
 * @param {Object} fieldSelectors - Multiple selector strategies for the field
 * @param {string} value - Value to fill
 * @returns {Promise<void>}
 */
async function selfHealingFill(page, fieldSelectors, value) {
  const element = await getSelfHealingElement(page, fieldSelectors);
  await element.fill(value);
}

/**
 * Click element with self-healing capability
 * 
 * @param {Object} page - Playwright page object
 * @param {Object} elementSelectors - Multiple selector strategies for the element
 * @returns {Promise<void>}
 */
async function selfHealingClick(page, elementSelectors) {
  const element = await getSelfHealingElement(page, elementSelectors);
  await element.click();
}

/**
 * Check if element exists with self-healing capability
 * 
 * @param {Object} page - Playwright page object
 * @param {Object} elementSelectors - Multiple selector strategies for the element
 * @returns {Promise<boolean>} - Whether the element exists
 */
async function selfHealingExists(page, elementSelectors) {
  try {
    await getSelfHealingElement(page, elementSelectors, 1000);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get element text with self-healing capability
 * 
 * @param {Object} page - Playwright page object
 * @param {Object} elementSelectors - Multiple selector strategies for the element
 * @returns {Promise<string>} - Element text content
 */
async function selfHealingGetText(page, elementSelectors) {
  const element = await getSelfHealingElement(page, elementSelectors);
  return element.textContent();
}

module.exports = {
  getSelfHealingElement,
  selfHealingFill,
  selfHealingClick,
  selfHealingExists,
  selfHealingGetText
};
