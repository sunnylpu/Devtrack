const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class TasksPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.newTaskButton = By.xpath("//button[contains(.,'New Task')]");
    this.modalTitleInput = By.xpath("//input[@placeholder='Task title...']");
    this.modalTagsInput = By.xpath("//input[@placeholder='Tags (comma separated)']");
    this.modalSubmitButton = By.xpath("//button[contains(.,'Create Task')]");
    this.modalCancelButton = By.xpath("//button[contains(.,'Cancel')]");
    this.generateSubtasksButton = By.xpath("//button[contains(.,'AI: Generate Subtasks') or contains(.,'Generating')]");
    this.moveForwardButton = By.xpath("//button[contains(.,'Move Forward')]");
  }

  async openTasks() {
    await this.navigateTo('/tasks');
    await this.waitForElement(this.newTaskButton);
  }

  async openCreateTaskModal() {
    await this.click(this.newTaskButton);
    await this.waitForElement(this.modalTitleInput);
  }

  async createTask(title, tags = '') {
    await this.openCreateTaskModal();
    await this.type(this.modalTitleInput, title);
    if (tags) {
      await this.type(this.modalTagsInput, tags);
    }
    await this.click(this.modalSubmitButton);
    await this.sleep(1000);
  }

  async hasTaskWithTitle(title) {
    const taskLocator = By.xpath(`//*[contains(text(),'${title}')]`);
    return await this.isElementPresent(taskLocator);
  }
}

module.exports = TasksPage;
