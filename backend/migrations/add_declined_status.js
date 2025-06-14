const { sequelize } = require('../config/database');
async function updateAppointmentStatusEnum() {
  try {
    console.log('Running migration: add declined status to appointments table');
    await sequelize.query(`
      ALTER TABLE appointments 
      MODIFY COLUMN status ENUM('scheduled', 'completed', 'cancelled', 'declined') 
      DEFAULT 'scheduled';
    `);  
    console.log('Successfully updated appointments status ENUM to include declined');
  } catch (error) {
    console.error('Error updating appointments table:', error);
    throw error;
  }
}
updateAppointmentStatusEnum()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 