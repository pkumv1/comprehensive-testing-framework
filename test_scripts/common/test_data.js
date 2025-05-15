/**
 * Utility for generating test data for login scenarios
 */

class TestDataGenerator {
  /**
   * Generate a random valid email address
   */
  static getValidEmail() {
    const randomId = Math.floor(Math.random() * 10000);
    return `user${randomId}@example.com`;
  }
  
  /**
   * Generate various invalid email addresses for testing
   */
  static getInvalidEmails() {
    return [
      'invalid-email',
      'user@',
      '@example.com',
      'user@example',
      'user.example.com',
    ];
  }
  
  /**
   * Generate a valid password that meets requirements
   */
  static getValidPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    // Generate random string at least 10 chars long
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure it has at least one number
    if (!/\d/.test(password)) {
      password += Math.floor(Math.random() * 10);
    }
    
    return password;
  }
  
  /**
   * Generate test users for various scenarios
   */
  static getTestUsers() {
    return [
      {
        email: 'admin@example.com',
        password: 'AdminPass123',
        role: 'admin',
      },
      {
        email: 'user@example.com',
        password: 'UserPass123',
        role: 'user',
      },
      {
        email: 'guest@example.com',
        password: 'GuestPass123',
        role: 'guest',
      },
    ];
  }
}

module.exports = TestDataGenerator;
