const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function resetDatabase() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port,
            multipleStatements: true // Enable multiple statements
        });

        // Create database if it doesn't exist and use it
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.query(`USE ${dbConfig.database}`);

        // Read and execute reset script
        const resetPath = path.join(__dirname, 'reset-db.sql');
        const resetScript = fs.readFileSync(resetPath, 'utf8');
        
        await connection.query(resetScript);
        console.log('Database reset successful! Tables have been recreated.');

        await connection.end();
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

// Run the reset
resetDatabase(); 