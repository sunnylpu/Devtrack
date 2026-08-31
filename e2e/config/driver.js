require('dotenv').config();
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const DEFAULT_TIMEOUT = parseInt(process.env.TEST_TIMEOUT || '10000', 10);
const IS_HEADLESS = process.env.HEADLESS === 'true' || process.env.CI === 'true';

/**
 * Creates and configures a Chrome WebDriver instance
 */
async function createDriver() {
  const options = new chrome.Options();

  if (IS_HEADLESS) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1440,900',
    '--ignore-certificate-errors',
    '--disable-extensions'
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: 2000,
    pageLoad: DEFAULT_TIMEOUT,
    script: DEFAULT_TIMEOUT,
  });

  return driver;
}

module.exports = {
  createDriver,
  BASE_URL,
  DEFAULT_TIMEOUT,
  IS_HEADLESS,
};
