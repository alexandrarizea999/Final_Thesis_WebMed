const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');
const User = require('../models/user');
const UserProfile = require('../models/user_profile');
const { sequelize } = require('../config/database');

// Admin user details
const adminUser = {
  email: 'admin@example.com',
  password: 'Admin123!', // This should be changed after first login
  role: 'admin',
  profile: {
    first_name: 'Admin',
    last_name: 'User',
    phone_number: '0700000000'
  }
};

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { 
        role: 'admin' 
      } 
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    // Create the admin user
    const user = await User.create({
      email: adminUser.email,
      password: hashedPassword,
      role: adminUser.role
    });

    // Create the admin user profile
    await UserProfile.create({
      user_id: user.id,
      first_name: adminUser.profile.first_name,
      last_name: adminUser.profile.last_name,
      phone_number: adminUser.profile.phone_number
    });

    console.log(`Admin user created successfully with ID: ${user.id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password} (change this after first login)`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser(); 