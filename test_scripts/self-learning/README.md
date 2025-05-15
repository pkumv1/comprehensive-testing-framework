# Self-Learning Test Automation

This directory contains self-learning test automation components that help improve test reliability over time by learning from previous test runs.

## Features

1. **Test Flakiness Detection**: Identifies flaky tests by analyzing test run history and patterns of failures.

2. **Selector Learning**: Automatically updates selectors based on successful test runs and DOM changes.

3. **Smart Wait Time Adjustment**: Dynamically adjusts wait times based on historical performance data.

4. **Behavioral Analysis**: Learns typical user flows and identifies anomalies in application behavior.

## Implementation Components

### 1. Selector Repository

The `SelectorRepository` class maintains a database of selectors and their success rates. It can recommend the most reliable selectors for elements based on historical data.

### 2. Test Execution Monitor

The `TestExecutionMonitor` records test execution details, including:
- Timing information for each step
- Success/failure status
- Screenshots at key points
- DOM snapshots

### 3. Smart Retry Logic

The `SmartRetry` mechanism intelligently retries failed tests with different strategies based on the failure pattern:
- Different selectors
- Adjusted timing
- Alternative user flows

### 4. ML-Based Analysis

Over time, the system builds a machine learning model that can:
- Predict which tests are likely to fail
- Suggest optimal selector strategies
- Recommend test improvements

## Usage Example

```javascript
const { SelectorLearner } = require('./selectorLearner');
const learner = new SelectorLearner();

// Train from previous test runs
await learner.loadHistory();

// Get recommended selector for an element
const selector = await learner.getBestSelector('loginButton');

// Report success/failure for further learning
await learner.reportSelectorResult('loginButton', selector, true);
```

## Integration with Testing Frameworks

The self-learning components integrate with Playwright, Selenium, and Puppeteer through adapter modules that hook into the test lifecycle events.
