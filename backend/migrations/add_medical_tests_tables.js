const { sequelize } = require('../config/database');
(async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS medical_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        test_date DATE NOT NULL,
        test_name VARCHAR(100) NOT NULL,
        test_category VARCHAR(50) NOT NULL,
        notes TEXT,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      );
    `);
    console.log('Medical tests table created successfully');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_parameters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        parameter_name VARCHAR(100) NOT NULL,
        value FLOAT NOT NULL,
        unit VARCHAR(20) NOT NULL,
        min_reference FLOAT,
        max_reference FLOAT,
        is_normal BOOLEAN NOT NULL DEFAULT TRUE,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (test_id) REFERENCES medical_tests(id) ON DELETE CASCADE
      );
    `);
    console.log('Test parameters table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating medical tests tables:', error);
    process.exit(1);
  }
})(); 