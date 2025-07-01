// Importăm modulele necesare pentru inițializarea bazei de date
const fs = require('fs');                 // Pentru operații cu fișiere
const path = require('path');             // Pentru manipularea căilor în sistem
const mysql = require('mysql2/promise');   // Driver MySQL cu suport pentru Promises
const dbConfig = require('../config/db.config');  // Configurația bazei de date

// Funcție asincronă pentru inițializarea bazei de date
async function initializeDatabase() {
    try {
        // Creăm o conexiune la serverul MySQL (fără a specifica o bază de date)
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port,
            multipleStatements: true  // Permite executarea mai multor comenzi SQL într-un singur query
        });

        // Creăm baza de date dacă nu există
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        
        // Selectăm baza de date pentru utilizare
        await connection.query(`USE ${dbConfig.database}`);

        // Citim și executăm schema SQL pentru crearea tabelelor
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schema);
        
        console.log('Database tables created successfully!');
        
        // Închidem conexiunea la baza de date
        await connection.end();
    } catch (error) {
        // În caz de eroare, afișăm mesajul și oprim execuția programului
        console.error('Error initializing database:', error);
        process.exit(1);  // Ieșim din program cu cod de eroare 1
    }
}

// Executăm funcția de inițializare imediat ce scriptul este rulat
initializeDatabase(); 