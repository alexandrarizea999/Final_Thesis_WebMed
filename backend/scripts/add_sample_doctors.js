const { sequelize } = require('../config/database');
const User = require('../models/user');
const UserProfile = require('../models/user_profile');
const bcrypt = require('bcryptjs');

async function addSampleDoctors() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Sample doctor data with different specialties
    const doctors = [
      {
        email: 'dr.andreescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Adrian',
          last_name: 'Andreescu',
          phone_number: '0723111222',
          date_of_birth: '1975-02-15',
          gender: 'M',
          address: 'Strada Medicilor 10',
          city: 'București',
          county: 'București'
        },
        specialty: 'Cardiologie'
      },
      {
        email: 'dr.popescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Mihaela',
          last_name: 'Popescu',
          phone_number: '0734222333',
          date_of_birth: '1982-08-20',
          gender: 'F',
          address: 'Bulevardul Decebal 25',
          city: 'Cluj-Napoca',
          county: 'Cluj'
        },
        specialty: 'Pediatrie'
      },
      {
        email: 'dr.ionescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Cristian',
          last_name: 'Ionescu',
          phone_number: '0756333444',
          date_of_birth: '1978-11-05',
          gender: 'M',
          address: 'Strada Republicii 8',
          city: 'Iași',
          county: 'Iași'
        },
        specialty: 'Neurologie'
      },
      {
        email: 'dr.vasilescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Dana',
          last_name: 'Vasilescu',
          phone_number: '0767444555',
          date_of_birth: '1985-05-12',
          gender: 'F',
          address: 'Strada Primăverii 22',
          city: 'Timișoara',
          county: 'Timiș'
        },
        specialty: 'Dermatologie'
      },
      {
        email: 'dr.georgescu@example.com',
        password: 'Password123!',
        profile: {
          first_name: 'Bogdan',
          last_name: 'Georgescu',
          phone_number: '0745555666',
          date_of_birth: '1970-09-30',
          gender: 'M',
          address: 'Bulevardul Unirii 15',
          city: 'Constanța',
          county: 'Constanța'
        },
        specialty: 'Medicina Internă'
      }
    ];

    // Add doctors to the database
    let doctorsAdded = 0;

    for (const doctorData of doctors) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: doctorData.email } });
        if (existingUser) {
          console.log(`User with email ${doctorData.email} already exists. Skipping...`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(doctorData.password, salt);

        // Create user with doctor role
        const user = await User.create({
          email: doctorData.email,
          password: hashedPassword,
          role: 'doctor'
        });

        // Create user profile
        await UserProfile.create({
          user_id: user.id,
          ...doctorData.profile
        });

        doctorsAdded++;
        console.log(`Added doctor: ${doctorData.profile.first_name} ${doctorData.profile.last_name} (${doctorData.specialty})`);
      } catch (error) {
        console.error(`Error adding doctor ${doctorData.email}:`, error);
      }
    }

    console.log(`Successfully added ${doctorsAdded} doctors.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the function
addSampleDoctors(); 