// Importăm modulele necesare
const mysql = require('mysql2/promise');  // Driver-ul pentru MySQL cu suport pentru Promises
const fs = require('fs');                 // Modul pentru operații cu fișiere
const path = require('path');             // Modul pentru manipularea căilor
const dbConfig = require('./db.config');   // Configurația bazei de date

// Funcție asincronă pentru executarea script-urilor SQL
async function executeSql() {
  try {
    // Creăm o conexiune la baza de date folosind configurația
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true  // Permite executarea mai multor comenzi SQL într-un singur query
    });

    console.log(`Connected to database: ${dbConfig.database}`);
    
    // Citim fișierul SQL folosind calea relativă
    const sqlPath = path.join(__dirname, 'database.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL script...');
    // Executăm script-ul SQL și destructurăm rezultatele
    const [results] = await connection.query(sqlScript);
    console.log('SQL executed successfully!');
    
    // Închidem conexiunea la baza de date
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error executing SQL:', error);
  }
}

// Executăm funcția imediat ce fișierul este încărcat
executeSql(); 