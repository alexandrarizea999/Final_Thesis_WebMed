const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');
const User = require('../models/user');
const UserProfile = require('../models/user_profile');
const { sequelize } = require('../config/database');

// Dispatcher user details
const dispecerUser = {
  email: 'dispecer@example.com',
  password: 'Dispecer123!',
  role: 'dispecer',
  profile: {
    first_name: 'Dispatcher',
    last_name: 'User',
    phone_number: '0711111111'
  }
};

async function createDispecer() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Check if dispatcher already exists
    const existingDispecer = await User.findOne({ 
      where: { 
        role: 'dispecer' 
      } 
    });

    if (existingDispecer) {
      console.log('Dispatcher user already exists. Skipping creation.');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(dispecerUser.password, 10);
    
    // Create the dispatcher user
    const user = await User.create({
      email: dispecerUser.email,
      password: hashedPassword,
      role: dispecerUser.role
    });

    // Create the dispatcher user profile
    await UserProfile.create({
      user_id: user.id,
      first_name: dispecerUser.profile.first_name,
      last_name: dispecerUser.profile.last_name,
      phone_number: dispecerUser.profile.phone_number
    });

    console.log(`Dispatcher user created successfully with ID: ${user.id}`);
    console.log(`Email: ${dispecerUser.email}`);
    console.log(`Password: ${dispecerUser.password} (change this after first login)`);
  } catch (error) {
    console.error('Error creating dispatcher user:', error);
  } finally {
    process.exit();
  }
}

createDispecer(); 