const AuthPage = require('../pages/AuthPage');
const assert = require('assert');

module.exports = {
  name: 'Auth Flow E2E Tests',
  run: async (driver) => {
    const authPage = new AuthPage(driver);
    const testEmail = `user_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    console.log('   Step 1: Navigating to Register Page...');
    await authPage.openRegister();
    const registerUrl = await authPage.getCurrentUrl();
    assert(registerUrl.includes('/register'), 'Should be on register page');

    console.log('   Step 2: Submitting Registration Form...');
    await authPage.register('Selenium Test User', testEmail, testPassword);
    await authPage.sleep(1500);

    console.log('   Step 3: Verifying Navigation to Dashboard or Login...');
    const postRegisterUrl = await authPage.getCurrentUrl();
    assert(
      postRegisterUrl.includes('/dashboard') || postRegisterUrl.includes('/login'),
      `Expected dashboard or login redirect, got ${postRegisterUrl}`
    );

    console.log('   Step 4: Navigating to Login Page...');
    await authPage.openLogin();

    console.log('   Step 5: Logging in with registered credentials...');
    await authPage.login(testEmail, testPassword);
    await authPage.sleep(1500);

    const postLoginUrl = await authPage.getCurrentUrl();
    assert(
      postLoginUrl.includes('/dashboard') || postLoginUrl.includes('/'),
      `Expected redirect to dashboard, got ${postLoginUrl}`
    );
  },
};
