const TasksPage = require('../pages/TasksPage');
const assert = require('assert');

module.exports = {
  name: 'Kanban Tasks Management E2E Tests',
  run: async (driver) => {
    const tasksPage = new TasksPage(driver);
    const taskTitle = `E2E Task ${Date.now()}`;

    console.log('   Step 1: Navigating to Tasks Page...');
    await tasksPage.openTasks();

    console.log('   Step 2: Creating a new task...');
    await tasksPage.createTask(taskTitle, 'e2e, testing');

    console.log('   Step 3: Verifying task appears on Kanban board...');
    const exists = await tasksPage.hasTaskWithTitle(taskTitle);
    assert(exists, `Expected task '${taskTitle}' to be visible on the board`);
  },
};
