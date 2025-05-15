import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

// Define custom metrics
const loginFailureRate = new Rate('login_failure_rate');

export const options = {
  // Test scenarios
  scenarios: {
    // Normal load
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 10 }, // Ramp up to 10 users over 1 minute
        { duration: '3m', target: 10 }, // Stay at 10 users for 3 minutes
        { duration: '1m', target: 0 },  // Ramp down to 0 users over 1 minute
      ],
      gracefulRampDown: '30s',
    },
    // Stress test
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },  // Ramp up to 50 users over a minute
        { duration: '5m', target: 50 },  // Stay at 50 users for 5 minutes
        { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
        { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
        { duration: '2m', target: 0 },   // Ramp down to 0 users
      ],
      gracefulRampDown: '30s',
    },
  },
  // Thresholds
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests must complete below 500ms, 99% below 1s
    'http_req_duration{staticAsset:yes}': ['p(95)<100'], // Static assets should be faster
    login_failure_rate: ['rate<0.1'], // Login failures should be less than 10%
    http_req_failed: ['rate<0.05'], // Request failures should be less than 5%
  },
};

// Login function
function performLogin(username, password) {
  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('https://example.com/api/login', payload, params);
  
  // Check if login was successful
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has token': (r) => r.json().token !== undefined,
  });

  // Record failure rate
  loginFailureRate.add(!success);

  return res;
}

// Load test for static assets
function loadStaticAssets() {
  const responses = http.batch([
    ['GET', 'https://example.com/static/css/main.css', null, { tags: { staticAsset: 'yes' } }],
    ['GET', 'https://example.com/static/js/bundle.js', null, { tags: { staticAsset: 'yes' } }],
    ['GET', 'https://example.com/static/images/logo.png', null, { tags: { staticAsset: 'yes' } }],
  ]);

  // Check that all static assets loaded successfully
  check(responses[0], { 'main.css loaded': (res) => res.status === 200 });
  check(responses[1], { 'bundle.js loaded': (res) => res.status === 200 });
  check(responses[2], { 'logo.png loaded': (res) => res.status === 200 });
}

// Main test function
export default function() {
  // Visit the login page
  let res = http.get('https://example.com/login');
  check(res, { 'login page loaded': (r) => r.status === 200 });

  // Load static assets for the login page
  loadStaticAssets();

  // Wait for a randomized thinking time (1-5 seconds)
  sleep(Math.random() * 4 + 1);

  // Attempt login with a 90% chance of using correct credentials
  const useCorrectPassword = Math.random() < 0.9;
  const username = `user${Math.floor(Math.random() * 10000)}@example.com`;
  const password = useCorrectPassword ? 'correctpassword' : 'wrongpassword';
  
  res = performLogin(username, password);

  // If login successful, visit dashboard
  if (res.status === 200) {
    const token = res.json().token;
    
    // Visit dashboard with token
    res = http.get('https://example.com/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    check(res, { 'dashboard loaded': (r) => r.status === 200 });
    
    // Simulate user interaction with dashboard
    sleep(Math.random() * 10 + 5);
  } else {
    // On failed login, wait and try again
    sleep(Math.random() * 3 + 1);
  }

  // Add random sleep between iterations
  sleep(Math.random() * 3 + 1);
}
