// Importăm Sequelize și configurația bazei de date
const { Sequelize } = require('sequelize');
const dbConfig = require('./db.config');

// Creăm o nouă instanță Sequelize pentru conexiunea la baza de date
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: 'mysql',
    logging: console.log, // Activăm logging-ul pentru a vedea query-urile SQL
    pool: {
      max: 5,           // Numărul maxim de conexiuni în pool
      min: 0,       // Numărul minim de conexiuni în pool
      acquire: 30000,  // Timpul maxim (ms) pentru a obține o conexiune
      idle: 10000     // Timpul maxim (ms) în care o conexiune poate fi inactivă
    }
  }
);

// Configurăm interfața pentru query-uri și adăugăm handling pentru erori
const queryInterface = sequelize.getQueryInterface();
const originalShowIndex = queryInterface.showIndex.bind(queryInterface);
queryInterface.showIndex = async (tableName, options) => {
  try {
    return await originalShowIndex(tableName, options);
  } catch (error) {
    if (error && error.parent && error.parent.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`Skipping showIndex for missing table: ${tableName}`);
      return [];
    }
    throw error;
  }
};

// Flag pentru resetarea bazei de date 
const shouldResetDatabase = process.env.RESET_DB === 'true';

// Funcția principală pentru inițializarea bazei de date
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Dacă este setat flag-ul de reset, ștergem toate tabelele
    if (shouldResetDatabase) {
      console.log('RESET_DB flag set to true, dropping all tables...');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.query('DROP TABLE IF EXISTS `appointments`');
      await sequelize.query('DROP TABLE IF EXISTS `doctor_availability`');
      await sequelize.query('DROP TABLE IF EXISTS `medical_records`');
      await sequelize.query('DROP TABLE IF EXISTS `user_profiles`');
      await sequelize.query('DROP TABLE IF EXISTS `users`'); 
      console.log('All tables dropped successfully.');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    // Creăm tabelul pentru utilizatori (users)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('patient', 'doctor') NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Creăm tabelul pentru profilurile utilizatorilor (user_profiles)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255),
        date_of_birth DATE,
        gender ENUM('M', 'F', 'Other'),
        address VARCHAR(255),
        city VARCHAR(255),
        county VARCHAR(255),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Creăm tabelul pentru disponibilitatea doctorilor (doctor_availability)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS doctor_availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Creăm tabelul pentru programări (appointments)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        reason TEXT,
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Creăm tabelul pentru fișele medicale (medical_records)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATETIME NOT NULL,
        diagnosis VARCHAR(255) NOT NULL,
        prescription TEXT,
        notes TEXT,
        doctor_name VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Database tables verified/created successfully.');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Funcție pentru resetarea completă a bazei de date
const resetDatabase = async () => {
  process.env.RESET_DB = 'true';
  await initDatabase();
  process.env.RESET_DB = 'false';
  console.log('Database has been reset successfully');
};

// Exportăm funcțiile și instanța Sequelize pentru a fi folosite în alte părți ale aplicației
module.exports = { sequelize, initDatabase, resetDatabase }; 