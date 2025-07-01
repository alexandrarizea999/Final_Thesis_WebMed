const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');
async function run() {
  const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    logging: false
  });
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('patient', 'doctor', 'admin') NOT NULL;
    `);

    console.log('Migration completed: added admin role to users table');
    process.exit(0);
  } catch (error) {
    console.error('Error performing migration:', error);
    process.exit(1);
  }
}
run(); 

