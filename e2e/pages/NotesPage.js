const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class NotesPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.newNoteButton = By.xpath("//button[contains(.,'New Note') or contains(.,'Create Note')]");
    this.noteTitleInput = By.xpath("//input[contains(@placeholder,'Title') or contains(@placeholder,'Note title')]");
    this.searchInput = By.xpath("//input[contains(@placeholder,'Search')]");
  }

  async openNotes() {
    await this.navigateTo('/notes');
    await this.sleep(800);
  }
}

module.exports = NotesPage;
