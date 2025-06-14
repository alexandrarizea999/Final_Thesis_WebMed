const { sequelize } = require('../config/database');

async function checkData() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    
    // Check appointments
    const [appResults] = await sequelize.query('SELECT COUNT(*) as count FROM appointments');
    console.log('Appointments count:', appResults[0].count);
    
    // Check users by role
    const [userResults] = await sequelize.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    console.log('Users by role:');
    userResults.forEach(row => {
      console.log(`  ${row.role}: ${row.count}`);
    });
    
    // Check if medical_records table exists
    try {
      const [tables] = await sequelize.query("SHOW TABLES LIKE 'medical_records'");
      if (tables.length > 0) {
        const [recResults] = await sequelize.query('SELECT COUNT(*) as count FROM medical_records');
        console.log('Medical records count:', recResults[0].count);
      } else {
        console.log('Medical records table does not exist');
      }
    } catch (err) {
      console.error('Error checking medical records:', err.message);
    }
    
    // Check if medical_tests table exists
    try {
      const [tables] = await sequelize.query("SHOW TABLES LIKE 'medical_tests'");
      if (tables.length > 0) {
        const [testResults] = await sequelize.query('SELECT COUNT(*) as count FROM medical_tests');
        console.log('Medical tests count:', testResults[0].count);
      } else {
        console.log('Medical tests table does not exist');
      }
    } catch (err) {
      console.error('Error checking medical tests:', err.message);
    }
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    process.exit();
  }
}

checkData(); 