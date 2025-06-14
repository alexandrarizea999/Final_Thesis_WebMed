const { sequelize } = require('./config/database');

(async () => {
  try {
    // Adaugă coloana access_code la tabelul medical_tests
    await sequelize.query(`
      ALTER TABLE medical_tests
      ADD COLUMN access_code VARCHAR(10) NOT NULL DEFAULT '' AFTER notes;
    `);

    console.log('Coloana access_code adăugată cu succes la tabelul medical_tests');
    
    // După ce am adăugat coloana, ștergem valoarea implicită
    await sequelize.query(`
      ALTER TABLE medical_tests
      MODIFY COLUMN access_code VARCHAR(10) NOT NULL;
    `);

    console.log('Modificare finalizată cu succes');
    process.exit(0);
  } catch (error) {
    console.error('Eroare la adăugarea coloanei:', error);
    process.exit(1);
  }
})(); 