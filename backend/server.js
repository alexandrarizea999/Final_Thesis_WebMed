// Importăm modulele necesare pentru server
const express = require('express');        // Framework-ul principal pentru API
const mysql = require('mysql2');           // Driver pentru MySQL
const bcrypt = require('bcryptjs');        // Pentru criptarea parolelor
const cors = require('cors');              // Pentru permiterea request-urilor cross-origin
const jwt = require('jsonwebtoken');       // Pentru generarea și verificarea token-urilor JWT
const dbConfig = require('./config/db.config');          // Configurație bază de date
const authConfig = require('./config/auth.config');      // Configurație autentificare
const { sequelize, initDatabase } = require('./config/database');  // ORM Sequelize și inițializare DB

// Importăm modelele pentru baza de date
const User = require('./models/user');
const UserProfile = require('./models/user_profile');
const Appointment = require('./models/appointment');
const DoctorAvailability = require('./models/doctor_availability');
const VisitorAppointment = require('./models/visitor_appointment');
const MedicalTest = require('./models/medical_test');
const TestParameter = require('./models/test_parameter');

// Importăm rutele API
const medicalRecordsRouter = require('./routes/medical_records');
const usersRouter = require('./routes/users');
const availabilityRouter = require('./routes/availability');
const appointmentsRouter = require('./routes/appointments');
const visitorAppointmentsRouter = require('./routes/visitor_appointments');
const medicalTestsRouter = require('./routes/medical_tests');
const loyaltyRouter = require('./routes/loyalty');

// Inițializăm aplicația Express
const app = express();
const port = process.env.PORT || 5000;  // Portul pe care va rula serverul

// Cheia secretă pentru JWT din configurație
const JWT_SECRET = authConfig.JWT_SECRET;

// Configurăm middleware-ul CORS pentru a permite request-uri de la frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());  // Pentru parsarea body-ului JSON din request-uri

// Înregistrăm rutele API
app.use('/api/medical-records', medicalRecordsRouter);
app.use('/api/users', usersRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/visitor-appointment', visitorAppointmentsRouter);
app.use('/api/medical-tests', medicalTestsRouter);
app.use('/api/loyalty', loyaltyRouter);

// Creăm pool-ul de conexiuni la baza de date
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();  // Versiunea cu Promises pentru async/await

// Ruta pentru autentificare
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Căutăm utilizatorul și profilul său în baza de date
    const [users] = await promisePool.query(
      `SELECT users.*, 
              user_profiles.first_name, 
              user_profiles.last_name,
              user_profiles.phone_number,
              user_profiles.date_of_birth,
              user_profiles.gender,
              user_profiles.address,
              user_profiles.city,
              user_profiles.county
       FROM users 
       JOIN user_profiles ON users.id = user_profiles.user_id 
       WHERE email = ?`,
      [email]
    );

    // Verificăm dacă utilizatorul există
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    // Verificăm parola folosind bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generăm token-ul JWT pentru sesiune
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`
      },
      JWT_SECRET,
      { expiresIn: authConfig.tokenExpiration }
    );

    // Eliminăm parola din obiectul utilizator înainte de a-l trimite
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

// Ruta pentru înregistrare utilizatori noi
app.post('/api/register', async (req, res) => {
  const { user, profile } = req.body;

  try {
    // Obținem o conexiune din pool și începem o tranzacție
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Criptăm parola înainte de a o salva
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Inserăm utilizatorul în baza de date
      const [userResult] = await connection.query(
        'INSERT INTO users (email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [user.email, hashedPassword, user.role, now, now]
      );

      // Inserăm profilul utilizatorului
      await connection.query(
        `INSERT INTO user_profiles (
          user_id, first_name, last_name, phone_number, 
          date_of_birth, gender, address, city, county, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userResult.insertId,
          profile.first_name,
          profile.last_name,
          profile.phone_number,
          profile.date_of_birth,
          profile.gender,
          profile.address,
          profile.city,
          profile.county,
          now,
          now
        ]
      );

      // Confirmăm tranzacția și eliberăm conexiunea
      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Registration successful',
        userId: userResult.insertId
      });
    } catch (error) {
      // În caz de eroare, anulăm tranzacția și eliberăm conexiunea
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Verificăm dacă eroarea este de tip email duplicat
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Funcție pentru testarea conexiunii la baza de date
async function testConnection() {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Testăm conexiunea la pornirea serverului
testConnection();

// Ruta de bază pentru verificarea că serverul funcționează
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to WebMed API' });
});

// Funcție pentru inițializarea aplicației
const initializeApp = async () => {
  try {
    // Inițializăm baza de date
    await initDatabase();
    console.log('Database initialized successfully.');

    // Verificăm dacă există contul de test pentru doctor
    const [doctors] = await promisePool.query(
      "SELECT * FROM users WHERE email = 'doctor@test.com' AND role = 'doctor'"
    );

    // Dacă nu există, creăm datele de test
    if (doctors.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      // Creăm contul de doctor
      const [doctorResult] = await promisePool.query(
        'INSERT INTO users (email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        ['doctor@test.com', hashedPassword, 'doctor', now, now]
      );
      
      const doctorId = doctorResult.insertId;
      
      // Creăm profilul doctorului
      await promisePool.query(
        `INSERT INTO user_profiles (
          user_id, first_name, last_name, phone_number, 
          gender, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          doctorId,
          'John',
          'Doe',
          '123-456-7890',
          'M',
          now,
          now
        ]
      );
      
      // Setăm disponibilitatea implicită pentru doctor
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      for (const day of days) {
        await promisePool.query(
          `INSERT INTO doctor_availability (
            doctor_id, day_of_week, start_time, end_time, 
            is_available, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            doctorId,
            day,
            '09:00:00',
            '17:00:00',
            true,
            now,
            now
          ]
        );
      }
      
      console.log('Test data created successfully.');
    }

    // Funcție pentru pornirea serverului cu retry logic
    const startServer = (retries = 3) => {
      const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      }).on('error', async (error) => {
        if (error.code === 'EADDRINUSE') {
          // Dacă portul este ocupat, încercăm să-l eliberăm
          console.log(`Port ${port} is busy. Attempting to free it...`);
          if (retries > 0) {
            try {
              await new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec(`npx kill-port ${port}`, (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
              console.log(`Port ${port} has been freed. Retrying...`);
              setTimeout(() => startServer(retries - 1), 1000);
            } catch (err) {
              console.error('Failed to free port:', err);
              process.exit(1);
            }
          } else {
            console.error(`Failed to start server after ${3 - retries} attempts`);
            process.exit(1);
          }
        } else {
          console.error('Server error:', error);
          process.exit(1);
        }
      });
    };

    // Pornim serverul
    startServer();

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Inițializăm aplicația
initializeApp(); 