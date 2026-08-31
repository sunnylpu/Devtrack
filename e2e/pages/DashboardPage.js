const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Dashboard elements
    this.pageHeader = By.css('h1');
    this.sidebar = By.css('aside, nav, .sidebar');
    this.productivityCard = By.xpath("//*[contains(text(),'Productivity') or contains(text(),'Score') or contains(text(),'Tasks')]");

    // Nav links
    this.tasksNavLink = By.xpath("//a[contains(@href,'tasks')]");
    this.habitsNavLink = By.xpath("//a[contains(@href,'habits')]");
    this.notesNavLink = By.xpath("//a[contains(@href,'notes')]");
    this.focusNavLink = By.xpath("//a[contains(@href,'focus')]");
    this.settingsNavLink = By.xpath("//a[contains(@href,'settings')]");
  }

  async openDashboard() {
    await this.navigateTo('/dashboard');
    await this.waitForElement(this.pageHeader);
  }

  async goToTasks() {
    await this.click(this.tasksNavLink);
    await this.sleep(800);
  }

  async goToHabits() {
    await this.click(this.habitsNavLink);
    await this.sleep(800);
  }

  async goToNotes() {
    await this.click(this.notesNavLink);
    await this.sleep(800);
  }

  async goToFocus() {
    await this.click(this.focusNavLink);
    await this.sleep(800);
  }

  async goToSettings() {
    await this.click(this.settingsNavLink);
    await this.sleep(800);
  }
}

module.exports = DashboardPage;
