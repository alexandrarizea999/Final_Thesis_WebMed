const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dbConfig = require('./db.config');

async function executeSql() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true 
    });

    console.log(`Connected to database: ${dbConfig.database}`);
    const sqlPath = path.join(__dirname, 'database.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing SQL script...');
    const [results] = await connection.query(sqlScript);
    console.log('SQL executed successfully!');
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error executing SQL:', error);
  }
}
executeSql(); 