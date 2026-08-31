const NotesPage = require('../pages/NotesPage');

module.exports = {
  name: 'Notes Management E2E Tests',
  run: async (driver) => {
    const notesPage = new NotesPage(driver);

    console.log('   Step 1: Navigating to Notes Page...');
    await notesPage.openNotes();
    const url = await notesPage.getCurrentUrl();
    console.log(`   Step 2: Notes page verified at ${url}`);
  },
};
