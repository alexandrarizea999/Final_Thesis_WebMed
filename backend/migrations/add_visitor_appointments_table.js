const { sequelize } = require('../config/database');

(async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS visitor_appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        specialty VARCHAR(100) NOT NULL,
        preferredDate DATE NOT NULL,
        notes TEXT,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        processed BOOLEAN DEFAULT false,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    console.log('Visitor appointments table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating visitor appointments table:', error);
    process.exit(1);
  }
})(); 