const { sequelize } = require('../config/database');
const User = require('../models/user');
const UserProfile = require('../models/user_profile');
const bcrypt = require('bcryptjs');

async function addSamplePatients() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Sample patient data
    const patients = [
      {
        email: 'maria.popescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Maria',
          last_name: 'Popescu',
          phone_number: '0722123456',
          date_of_birth: '1985-04-12',
          gender: 'F',
          address: 'Strada Primăverii 15, Bl. B2, Ap. 24',
          city: 'București',
          county: 'București'
        }
      },
      {
        email: 'ion.dumitrescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Ion',
          last_name: 'Dumitrescu',
          phone_number: '0733456789',
          date_of_birth: '1978-09-23',
          gender: 'M',
          address: 'Strada Gheorghe Lazăr 8',
          city: 'Cluj-Napoca',
          county: 'Cluj'
        }
      },
      {
        email: 'elena.ionescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Elena',
          last_name: 'Ionescu',
          phone_number: '0745678901',
          date_of_birth: '1992-07-15',
          gender: 'F',
          address: 'Bulevardul Revoluției 42',
          city: 'Timișoara',
          county: 'Timiș'
        }
      },
      {
        email: 'alexandru.popa@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Alexandru',
          last_name: 'Popa',
          phone_number: '0756789012',
          date_of_birth: '1980-11-30',
          gender: 'M',
          address: 'Strada Mihai Eminescu 17',
          city: 'Iași',
          county: 'Iași'
        }
      },
      {
        email: 'ana.georgescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Ana',
          last_name: 'Georgescu',
          phone_number: '0767890123',
          date_of_birth: '1995-02-08',
          gender: 'F',
          address: 'Aleea Parcului 7, Bl. D4, Sc. A, Ap. 12',
          city: 'Constanța',
          county: 'Constanța'
        }
      },
      {
        email: 'mihai.stanescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Mihai',
          last_name: 'Stanescu',
          phone_number: '0778901234',
          date_of_birth: '1973-06-25',
          gender: 'M',
          address: 'Bulevardul Independenței 103',
          city: 'Brașov',
          county: 'Brașov'
        }
      },
      {
        email: 'gabriela.vasilescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Gabriela',
          last_name: 'Vasilescu',
          phone_number: '0789012345',
          date_of_birth: '1988-12-17',
          gender: 'F',
          address: 'Strada Avram Iancu 29',
          city: 'Oradea',
          county: 'Bihor'
        }
      },
      {
        email: 'tudor.marinescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Tudor',
          last_name: 'Marinescu',
          phone_number: '0790123456',
          date_of_birth: '1965-08-03',
          gender: 'M',
          address: 'Strada Centrală 5',
          city: 'Sibiu',
          county: 'Sibiu'
        }
      },
      {
        email: 'cristina.diaconu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Cristina',
          last_name: 'Diaconu',
          phone_number: '0701234567',
          date_of_birth: '1990-03-21',
          gender: 'F',
          address: 'Strada Victoriei 11, Bl. A3, Sc. 2, Ap. 45',
          city: 'Craiova',
          county: 'Dolj'
        }
      },
      {
        email: 'andrei.radu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Andrei',
          last_name: 'Radu',
          phone_number: '0712345678',
          date_of_birth: '1983-05-19',
          gender: 'M',
          address: 'Bulevardul Carol I 67',
          city: 'Galați',
          county: 'Galați'
        }
      }
    ];

    // Add patients to the database
    let patientsAdded = 0;

    for (const patientData of patients) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: patientData.email } });
        if (existingUser) {
          console.log(`User with email ${patientData.email} already exists. Skipping...`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(patientData.password, salt);

        // Create user
        const user = await User.create({
          email: patientData.email,
          password: hashedPassword,
          role: 'patient'
        });

        // Create user profile
        await UserProfile.create({
          user_id: user.id,
          ...patientData.profile
        });

        patientsAdded++;
        console.log(`Added patient: ${patientData.profile.first_name} ${patientData.profile.last_name}`);
      } catch (error) {
        console.error(`Error adding patient ${patientData.email}:`, error);
      }
    }

    console.log(`Successfully added ${patientsAdded} patients.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the function
addSamplePatients(); 