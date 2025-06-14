const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/db.config');

async function createDispecerUser() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert user
    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      ['dispecer@test.com', hashedPassword, 'dispecer', now, now]
    );

    // Insert user profile
    await connection.execute(
      `INSERT INTO user_profiles (
        user_id, first_name, last_name, phone_number, 
        date_of_birth, gender, address, city, county, 
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        'Ana',
        'Popescu',
        '0740123456',
        '1990-01-01',
        'F',
        'Str. Principala 123',
        'Bucuresti',
        'Sector 1',
        now,
        now
      ]
    );

    console.log('Dispecer user created successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Dispecer user already exists');
    } else {
      console.error('Error creating dispecer user:', error);
    }
  } finally {
    await connection.end();
  }
}

createDispecerUser(); 