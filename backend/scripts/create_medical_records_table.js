const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function createMedicalRecordsTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS medical_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        date DATETIME NOT NULL,
        diagnosis VARCHAR(255) NOT NULL,
        prescription TEXT,
        notes TEXT,
        doctor_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableSQL);
    console.log('Medical records table created successfully!');

    // Insert some sample data
    const sampleData = `
      INSERT INTO medical_records (user_id, date, diagnosis, prescription, notes, doctor_name)
      VALUES 
        (1, '2024-03-15 10:00:00', 'Common Cold', 'Rest and fluids', 'Patient should recover in a few days', 'John Smith'),
        (1, '2024-02-20 14:30:00', 'Annual Checkup', NULL, 'All vitals normal', 'Sarah Johnson'),
        (1, '2024-01-10 09:15:00', 'Sprained Ankle', 'Ice and elevation', 'Follow up in 2 weeks', 'Michael Brown')
    `;

    await connection.execute(sampleData);
    console.log('Sample medical records inserted successfully!');

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

createMedicalRecordsTable(); 