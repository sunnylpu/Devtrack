const { By, until } = require('selenium-webdriver');
const { BASE_URL, DEFAULT_TIMEOUT } = require('../config/driver');
const fs = require('fs');
const path = require('path');

class BasePage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = BASE_URL;
    this.timeout = DEFAULT_TIMEOUT;
  }

  async navigateTo(relativePath = '') {
    const url = `${this.baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
    await this.driver.get(url);
    await this.sleep(500);
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async waitForElement(locator, timeout = this.timeout) {
    const el = await this.driver.wait(until.elementLocated(locator), timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async waitForElementPresent(locator, timeout = this.timeout) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async isElementPresent(locator) {
    try {
      const elements = await this.driver.findElements(locator);
      return elements.length > 0;
    } catch {
      return false;
    }
  }

  async click(locator, timeout = this.timeout) {
    const el = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    await el.click();
  }

  async type(locator, text, timeout = this.timeout) {
    const el = await this.waitForElement(locator, timeout);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator, timeout = this.timeout) {
    const el = await this.waitForElement(locator, timeout);
    return (await el.getText()).trim();
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async takeScreenshot(fileName) {
    const screenshotsDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const image = await this.driver.takeScreenshot();
    const filePath = path.join(screenshotsDir, `${fileName}_${Date.now()}.png`);
    fs.writeFileSync(filePath, image, 'base64');
    return filePath;
  }
}

module.exports = BasePage;
