/**
 * Element Mapping for Self-Healing Tests
 * 
 * This file contains element selectors with multiple strategies for identifying elements.
 * This approach allows tests to continue working even when the primary selectors change.
 */

const LoginPageElements = {
  usernameField: {
    testId: 'username-input',
    id: 'username',
    css: 'input[type="email"], input[name="username"]',
    placeholder: 'Email or username',
    label: 'Username',
    xpath: '//label[contains(text(), "Username") or contains(text(), "Email")]//following-sibling::input'
  },
  passwordField: {
    testId: 'password-input',
    id: 'password',
    css: 'input[type="password"]',
    placeholder: 'Password',
    label: 'Password',
    xpath: '//label[contains(text(), "Password")]//following-sibling::input'
  },
  submitButton: {
    testId: 'login-submit',
    css: 'button[type="submit"], input[type="submit"]',
    text: 'Sign In',
    role: { role: 'button', name: 'Sign In' },
    xpath: '//button[contains(text(), "Sign In") or contains(text(), "Log In") or contains(text(), "Login")]'
  },
  forgotPasswordLink: {
    testId: 'forgot-password',
    css: 'a.forgot-password, a[href*="forgot"]',
    text: 'Forgot Password',
    xpath: '//a[contains(text(), "Forgot")]'
  },
  usernameError: {
    testId: 'username-error',
    id: 'username-error',
    css: '.username-error, #username-error, [aria-describedby="username"]',
    xpath: '//input[@id="username"]/following-sibling::div[contains(@class, "error")]'
  },
  passwordError: {
    testId: 'password-error',
    id: 'password-error',
    css: '.password-error, #password-error, [aria-describedby="password"]',
    xpath: '//input[@id="password"]/following-sibling::div[contains(@class, "error")]'
  },
  loginForm: {
    testId: 'login-form',
    css: 'form, .login-form',
    role: { role: 'form', name: '' },
    xpath: '//form[.//input[@type="password"]]'
  },
  rememberMeCheckbox: {
    testId: 'remember-me',
    id: 'remember',
    css: 'input[type="checkbox"]',
    label: 'Remember me',
    xpath: '//label[contains(text(), "Remember")]//input[@type="checkbox"]'
  }
};

const DashboardElements = {
  welcomeMessage: {
    testId: 'welcome-message',
    css: '.welcome-message, .greeting',
    xpath: '//h1[contains(text(), "Welcome") or contains(text(), "Dashboard")]'
  },
  logoutButton: {
    testId: 'logout-button',
    css: '.logout, button.logout, a.logout',
    text: 'Logout',
    role: { role: 'button', name: 'Logout' },
    xpath: '//button[contains(text(), "Logout") or contains(text(), "Sign Out")]'
  },
  userMenu: {
    testId: 'user-menu',
    css: '.user-menu, .profile-menu',
    xpath: '//div[contains(@class, "user-menu") or contains(@class, "profile")]'
  },
  navigationItems: {
    testId: 'nav-item',
    css: 'nav a, .sidebar a, .navigation a',
    xpath: '//nav//a'
  }
};

module.exports = {
  LoginPageElements,
  DashboardElements
};
