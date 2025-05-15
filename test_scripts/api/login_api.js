const { test, expect } = require('@playwright/test');

test.describe('Login API Tests', () => {
  test('successful login returns token', async ({ request }) => {
    const response = await request.post('https://example.com/api/login', {
      data: {
        username: 'user@example.com',
        password: 'correctpassword'
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeTruthy();
  });

  test('invalid credentials return 401', async ({ request }) => {
    const response = await request.post('https://example.com/api/login', {
      data: {
        username: 'user@example.com',
        password: 'wrongpassword'
      }
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Invalid credentials');
  });

  test('missing required fields return 400', async ({ request }) => {
    // Test missing username
    let response = await request.post('https://example.com/api/login', {
      data: {
        password: 'correctpassword'
      }
    });
    
    expect(response.status()).toBe(400);
    let body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('username');
    
    // Test missing password
    response = await request.post('https://example.com/api/login', {
      data: {
        username: 'user@example.com'
      }
    });
    
    expect(response.status()).toBe(400);
    body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('password');
  });

  test('login API rate limiting works', async ({ request }) => {
    // Make multiple rapid requests to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        request.post('https://example.com/api/login', {
          data: {
            username: `user${i}@example.com`,
            password: 'wrongpassword'
          }
        })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // At least one response should be rate limited (429)
    const hasRateLimitResponse = responses.some(response => response.status() === 429);
    expect(hasRateLimitResponse).toBe(true);
    
    // Check rate limit headers are present
    const rateLimitedResponse = responses.find(response => response.status() === 429);
    if (rateLimitedResponse) {
      expect(rateLimitedResponse.headers()['retry-after']).toBeTruthy();
    }
  });

  test('login token has proper structure and expires', async ({ request }) => {
    const response = await request.post('https://example.com/api/login', {
      data: {
        username: 'user@example.com',
        password: 'correctpassword'
      }
    });
    
    const body = await response.json();
    const token = body.token;
    
    // Token should be a JWT
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // JWT format check
    
    // Parse token (JWT has three parts: header, payload, signature)
    const parts = token.split('.');
    const payloadJson = Buffer.from(parts[1], 'base64').toString();
    const payload = JSON.parse(payloadJson);
    
    // Check token has expected fields
    expect(payload.sub).toBeTruthy(); // Subject (user ID)
    expect(payload.exp).toBeTruthy(); // Expiration time
    
    // Check token expiration is in the future
    const expirationTime = new Date(payload.exp * 1000);
    const now = new Date();
    expect(expirationTime > now).toBe(true);
  });
});
