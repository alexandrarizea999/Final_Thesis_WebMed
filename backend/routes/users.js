const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');
const User = require('../models/user');
const UserProfile = require('../models/user_profile');
const DoctorAvailability = require('../models/doctor_availability');
const bcrypt = require('bcryptjs');
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(`
      SELECT users.id, users.email, users.role, users.createdAt,
             user_profiles.first_name, user_profiles.last_name, 
             user_profiles.phone_number
      FROM users 
      JOIN user_profiles ON users.id = user_profiles.user_id
      ORDER BY users.role, user_profiles.last_name, user_profiles.first_name
    `); 
    await connection.end();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});
router.get('/patients', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [patients] = await connection.execute(`
      SELECT users.id, user_profiles.first_name, user_profiles.last_name, 
             users.email, user_profiles.phone_number
      FROM users 
      JOIN user_profiles ON users.id = user_profiles.user_id
      WHERE users.role = 'patient'
      ORDER BY user_profiles.last_name, user_profiles.first_name
    `); 
    await connection.end();
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients' });
  }
});
router.get('/doctors', auth, async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      include: [{
        model: UserProfile,
        as: 'user_profile',
        attributes: ['first_name', 'last_name']
      }],
      attributes: ['id', 'email']
    });
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      email: doctor.email,
      first_name: doctor.user_profile?.first_name || '',
      last_name: doctor.user_profile?.last_name || ''
    }));
    res.json(formattedDoctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});
router.get('/doctors/detailed', auth, async (req, res) => {
  if (req.user.role !== 'dispecer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Dispatchers and admins only.' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [doctors] = await connection.execute(`
      SELECT 
        users.id, 
        users.email, 
        user_profiles.first_name, 
        user_profiles.last_name, 
        user_profiles.phone_number,
        user_profiles.city,
        user_profiles.county
      FROM users 
      JOIN user_profiles ON users.id = user_profiles.user_id
      WHERE users.role = 'doctor'
      ORDER BY user_profiles.last_name, user_profiles.first_name
    `);
    await connection.end();
    const doctorsWithAvailability = await Promise.all(doctors.map(async (doctor) => {
      const availability = await DoctorAvailability.findAll({
        where: { doctor_id: doctor.id },
        attributes: ['id', 'day_of_week', 'start_time', 'end_time', 'is_available']
      });
      return {
        ...doctor,
        availability
      };
    }));
    res.json(doctorsWithAvailability);
  } catch (error) {
    console.error('Error fetching detailed doctors list:', error);
    res.status(500).json({ message: 'Error fetching detailed doctors list' });
  }
});
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body; 
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});
router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, phone_number, date_of_birth, gender, address, city, county } = req.body; 
    const userProfile = await UserProfile.findOne({
      where: { user_id: req.user.userId }
    });
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    if (first_name) userProfile.first_name = first_name;
    if (last_name) userProfile.last_name = last_name;
    if (phone_number !== undefined) userProfile.phone_number = phone_number;
    if (date_of_birth !== undefined) userProfile.date_of_birth = date_of_birth;
    if (gender !== undefined) userProfile.gender = gender;
    if (address !== undefined) userProfile.address = address;
    if (city !== undefined) userProfile.city = city;
    if (county !== undefined) userProfile.county = county;
    await userProfile.save();
    const updatedUser = await User.findByPk(req.user.userId, {
      include: [{
        model: UserProfile,
        as: 'user_profile'
      }],
      attributes: { exclude: ['password'] }
    });
    res.json({
      message: 'Profile updated successfully',
      user: {
        ...updatedUser.get(),
        first_name: updatedUser.user_profile.first_name,
        last_name: updatedUser.user_profile.last_name,
        phone_number: updatedUser.user_profile.phone_number,
        date_of_birth: updatedUser.user_profile.date_of_birth,
        gender: updatedUser.user_profile.gender,
        address: updatedUser.user_profile.address,
        city: updatedUser.user_profile.city,
        county: updatedUser.user_profile.county
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});
module.exports = router; 