const DashboardPage = require('../pages/DashboardPage');
const assert = require('assert');

module.exports = {
  name: 'Dashboard & Navigation E2E Tests',
  run: async (driver) => {
    const dashboardPage = new DashboardPage(driver);

    console.log('   Step 1: Navigating to Dashboard...');
    await dashboardPage.openDashboard();
    const url = await dashboardPage.getCurrentUrl();
    assert(url.includes('/dashboard'), 'Should be on dashboard route');

    console.log('   Step 2: Navigating to Kanban Tasks...');
    await dashboardPage.goToTasks();
    const tasksUrl = await dashboardPage.getCurrentUrl();
    assert(tasksUrl.includes('/tasks'), 'Should navigate to /tasks');

    console.log('   Step 3: Navigating to Habits Tracker...');
    await dashboardPage.goToHabits();
    const habitsUrl = await dashboardPage.getCurrentUrl();
    assert(habitsUrl.includes('/habits'), 'Should navigate to /habits');

    console.log('   Step 4: Navigating to Notes Page...');
    await dashboardPage.goToNotes();
    const notesUrl = await dashboardPage.getCurrentUrl();
    assert(notesUrl.includes('/notes'), 'Should navigate to /notes');

    console.log('   Step 5: Navigating to Focus Pomodoro Page...');
    await dashboardPage.goToFocus();
    const focusUrl = await dashboardPage.getCurrentUrl();
    assert(focusUrl.includes('/focus'), 'Should navigate to /focus');
  },
};
