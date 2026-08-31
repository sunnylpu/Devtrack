const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class FocusPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.timerDisplay = By.xpath("//*[contains(@class,'timer') or contains(text(),':')]");
    this.startPauseButton = By.xpath("//button[contains(.,'Start') or contains(.,'Pause') or contains(.,'Resume')]");
    this.resetButton = By.xpath("//button[contains(.,'Reset')]");
  }

  async openFocus() {
    await this.navigateTo('/focus');
    await this.sleep(800);
  }
}

module.exports = FocusPage;
