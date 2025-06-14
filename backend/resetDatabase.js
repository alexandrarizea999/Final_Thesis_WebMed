// Script to reset the database
// Run with: node resetDatabase.js

const { resetDatabase } = require('./config/database');

(async () => {
  try {
    console.log('Starting database reset...');
    await resetDatabase();
    console.log('Database reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
})(); 