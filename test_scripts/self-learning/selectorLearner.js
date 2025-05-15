/**
 * Selector Learner Module
 * 
 * This module implements a self-learning system for selectors that improves
 * over time as tests are executed. It records which selectors work reliably
 * and adapts to changes in the application.
 */

class SelectorLearner {
  constructor() {
    // Initialize selector history storage
    this.selectorHistory = {};
    this.successRates = {};
    this.lastUpdated = {};
  }

  /**
   * Load historical selector data from local storage/file/database
   */
  async loadHistory() {
    try {
      // In a real implementation, this would load from persistent storage
      console.log('Loading selector history...');
      // For demonstration, we'll initialize with some sample data
      this.selectorHistory = {
        'loginButton': [
          { selector: '[data-testid="login-submit"]', successes: 95, attempts: 100 },
          { selector: 'button[type="submit"]', successes: 88, attempts: 100 },
          { selector: '.login-button', successes: 72, attempts: 100 },
          { selector: '//button[contains(text(), "Sign In")]', successes: 68, attempts: 100 }
        ],
        'usernameField': [
          { selector: '#username', successes: 100, attempts: 100 },
          { selector: 'input[type="email"]', successes: 92, attempts: 100 },
          { selector: '[data-testid="username-input"]', successes: 90, attempts: 100 },
          { selector: 'input[name="username"]', successes: 85, attempts: 100 }
        ]
      };

      // Calculate success rates
      this._updateSuccessRates();
      console.log('Selector history loaded successfully');
    } catch (error) {
      console.error('Error loading selector history:', error);
    }
  }

  /**
   * Save current selector history to persistent storage
   */
  async saveHistory() {
    try {
      // In a real implementation, this would save to persistent storage
      console.log('Saving selector history...');
      console.log('Selector history saved successfully');
    } catch (error) {
      console.error('Error saving selector history:', error);
    }
  }

  /**
   * Update success rates based on selector history
   */
  _updateSuccessRates() {
    Object.keys(this.selectorHistory).forEach(elementId => {
      this.successRates[elementId] = this.selectorHistory[elementId].map(entry => {
        return {
          selector: entry.selector,
          rate: (entry.successes / entry.attempts) * 100
        };
      }).sort((a, b) => b.rate - a.rate); // Sort by success rate, descending
    });
  }

  /**
   * Get the best selector for a given element based on historical performance
   * @param {string} elementId - Logical identifier for the element
   * @returns {Promise<string>} - Best selector to use
   */
  async getBestSelector(elementId) {
    if (!this.successRates[elementId] || this.successRates[elementId].length === 0) {
      console.warn(`No selector history found for element: ${elementId}`);
      return null;
    }

    // Return the selector with the highest success rate
    return this.successRates[elementId][0].selector;
  }

  /**
   * Get multiple selectors to try, in order of historical reliability
   * @param {string} elementId - Logical identifier for the element
   * @param {number} count - Number of selectors to return
   * @returns {Promise<Array<string>>} - Ordered list of selectors to try
   */
  async getRankedSelectors(elementId, count = 3) {
    if (!this.successRates[elementId] || this.successRates[elementId].length === 0) {
      console.warn(`No selector history found for element: ${elementId}`);
      return [];
    }

    // Return top N selectors by success rate
    return this.successRates[elementId]
      .slice(0, Math.min(count, this.successRates[elementId].length))
      .map(entry => entry.selector);
  }

  /**
   * Report the result of using a selector for further learning
   * @param {string} elementId - Logical identifier for the element
   * @param {string} selector - The selector that was used
   * @param {boolean} success - Whether the selector worked successfully
   */
  async reportSelectorResult(elementId, selector, success) {
    if (!this.selectorHistory[elementId]) {
      this.selectorHistory[elementId] = [];
    }

    // Find the entry for this selector
    let entry = this.selectorHistory[elementId].find(e => e.selector === selector);
    
    if (!entry) {
      // Create a new entry if it doesn't exist
      entry = { selector, successes: 0, attempts: 0 };
      this.selectorHistory[elementId].push(entry);
    }

    // Update the entry
    entry.attempts++;
    if (success) {
      entry.successes++;
    }

    // Update last modified timestamp
    this.lastUpdated[elementId] = new Date();

    // Update success rates
    this._updateSuccessRates();

    // Save updated history
    await this.saveHistory();
  }

  /**
   * Learn new selectors from DOM analysis
   * @param {Object} page - Playwright/Puppeteer page object
   * @param {string} elementId - Logical identifier for the element
   * @param {string} knownSelector - A selector known to work for this element
   */
  async learnNewSelectors(page, elementId, knownSelector) {
    try {
      // Use a known working selector to find the element
      const element = await page.$(knownSelector);
      if (!element) return;

      // In a real implementation, this would analyze the element and generate alternative selectors
      const newSelectors = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return [];

        const selectors = [];

        // ID selector
        if (element.id) {
          selectors.push(`#${element.id}`);
        }

        // Class selector (using the most specific class)
        if (element.classList.length > 0) {
          selectors.push(`.${element.classList[0]}`);
        }

        // Tag name with attribute selector
        const tagName = element.tagName.toLowerCase();
        for (const attr of ['name', 'type', 'data-testid', 'aria-label']) {
          if (element.hasAttribute(attr)) {
            selectors.push(`${tagName}[${attr}="${element.getAttribute(attr)}"]`);
          }
        }

        // XPath by text content
        if (element.textContent && element.textContent.trim()) {
          selectors.push(`//${tagName}[contains(text(), "${element.textContent.trim()}")]`);
        }

        return selectors;
      }, knownSelector);

      // Add these selectors to our history with initial values
      if (!this.selectorHistory[elementId]) {
        this.selectorHistory[elementId] = [];
      }

      for (const selector of newSelectors) {
        // Don't add if it already exists
        if (!this.selectorHistory[elementId].some(e => e.selector === selector)) {
          this.selectorHistory[elementId].push({
            selector,
            successes: 1, // Start with one success since we know it works
            attempts: 1
          });
        }
      }

      // Update success rates
      this._updateSuccessRates();

      // Save updated history
      await this.saveHistory();

      console.log(`Learned ${newSelectors.length} new selectors for ${elementId}`);
    } catch (error) {
      console.error('Error learning new selectors:', error);
    }
  }
}

module.exports = { SelectorLearner };
