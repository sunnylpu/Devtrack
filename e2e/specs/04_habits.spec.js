const HabitsPage = require('../pages/HabitsPage');

module.exports = {
  name: 'Habits Tracking E2E Tests',
  run: async (driver) => {
    const habitsPage = new HabitsPage(driver);
    const habitName = `Habit ${Date.now()}`;

    console.log('   Step 1: Navigating to Habits Page...');
    await habitsPage.openHabits();

    console.log('   Step 2: Creating a new habit...');
    await habitsPage.createHabit(habitName, 'Daily consistency test');

    console.log('   Step 3: Performing daily check-in...');
    await habitsPage.checkInFirstHabit();
  },
};
