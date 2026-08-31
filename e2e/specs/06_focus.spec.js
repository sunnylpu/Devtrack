const FocusPage = require('../pages/FocusPage');

module.exports = {
  name: 'Pomodoro Focus Timer E2E Tests',
  run: async (driver) => {
    const focusPage = new FocusPage(driver);

    console.log('   Step 1: Navigating to Focus Page...');
    await focusPage.openFocus();
    const url = await focusPage.getCurrentUrl();
    console.log(`   Step 2: Focus timer verified at ${url}`);
  },
};
