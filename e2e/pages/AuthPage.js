const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class AuthPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Login Locators
    this.loginEmailInput = By.id('login-email');
    this.loginPasswordInput = By.id('login-password');
    this.loginSubmitButton = By.css('button.auth-submit');
    this.goToRegisterLink = By.linkText('Sign up');

    // Register Locators
    this.registerNameInput = By.id('register-name');
    this.registerEmailInput = By.id('register-email');
    this.registerPasswordInput = By.id('register-password');
    this.registerSubmitButton = By.css('button.auth-submit');
    this.goToLoginLink = By.linkText('Sign in');

    // Shared Locators
    this.authCard = By.css('.auth-card');
  }

  async openLogin() {
    await this.navigateTo('/login');
    await this.waitForElement(this.loginEmailInput);
  }

  async openRegister() {
    await this.navigateTo('/register');
    await this.waitForElement(this.registerNameInput);
  }

  async login(email, password) {
    await this.type(this.loginEmailInput, email);
    await this.type(this.loginPasswordInput, password);
    await this.click(this.loginSubmitButton);
    await this.sleep(1000);
  }

  async register(name, email, password) {
    await this.type(this.registerNameInput, name);
    await this.type(this.registerEmailInput, email);
    await this.type(this.registerPasswordInput, password);
    await this.click(this.registerSubmitButton);
    await this.sleep(1000);
  }
}

module.exports = AuthPage;
