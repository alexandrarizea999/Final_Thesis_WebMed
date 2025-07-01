// Importăm modulele necesare pentru resetarea bazei de date
const fs = require('fs');                 // Pentru operații cu fișiere
const path = require('path');             // Pentru manipularea căilor în sistem
const mysql = require('mysql2/promise');   // Driver MySQL cu suport pentru Promises
const dbConfig = require('../config/db.config');  // Configurația bazei de date

// Funcție asincronă pentru resetarea completă a bazei de date
async function resetDatabase() {
    try {
        // Creăm o conexiune la serverul MySQL
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port,
            multipleStatements: true  // Permite executarea mai multor comenzi SQL într-un singur query
        });

        // Ne asigurăm că baza de date există și o selectăm
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.query(`USE ${dbConfig.database}`);

        // Citim scriptul SQL de resetare care va șterge și recrea toate tabelele
        const resetPath = path.join(__dirname, 'reset-db.sql');
        const resetScript = fs.readFileSync(resetPath, 'utf8');
        
        // Executăm scriptul de resetare
        await connection.query(resetScript);
        console.log('Database reset successful! Tables have been recreated.');

        // Închidem conexiunea la baza de date
        await connection.end();
    } catch (error) {
        // În caz de eroare, afișăm mesajul și oprim execuția programului
        console.error('Error resetting database:', error);
        process.exit(1);  // Ieșim din program cu cod de eroare 1
    }
}

// Executăm funcția de resetare imediat ce scriptul este rulat
resetDatabase(); 