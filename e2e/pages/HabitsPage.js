const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class HabitsPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.newHabitButton = By.xpath("//button[contains(.,'New Habit') or contains(.,'Create First Habit')]");
    this.habitNameInput = By.xpath("//input[contains(@placeholder,'run') or contains(@placeholder,'Morning')]");
    this.habitDescriptionInput = By.xpath("//input[contains(@placeholder,'Description')]");
    this.createHabitSubmitButton = By.xpath("//button[contains(.,'Create Habit')]");
    this.checkInButton = By.xpath("//button[contains(.,'Check In') or contains(.,'Completed Today')]");
  }

  async openHabits() {
    await this.navigateTo('/habits');
    await this.waitForElementPresent(this.newHabitButton);
  }

  async createHabit(name, description = '') {
    await this.click(this.newHabitButton);
    await this.waitForElement(this.habitNameInput);
    await this.type(this.habitNameInput, name);
    if (description) {
      await this.type(this.habitDescriptionInput, description);
    }
    await this.click(this.createHabitSubmitButton);
    await this.sleep(1000);
  }

  async checkInFirstHabit() {
    if (await this.isElementPresent(this.checkInButton)) {
      await this.click(this.checkInButton);
      await this.sleep(1000);
    }
  }
}

module.exports = HabitsPage;
