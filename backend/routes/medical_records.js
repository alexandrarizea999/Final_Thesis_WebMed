const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/medical_record');
const auth = require('../middleware/auth');
const mysql = require('mysql2');
const dbConfig = require('../config/db.config');
const { sequelize } = require('../config/database');
router.get('/my-records', auth, async (req, res) => {
  try {
    const records = await MedicalRecord.findAll({
      where: { user_id: req.user.userId },
      order: [['date', 'DESC']]
    });
    if (!records) {
      return res.status(404).json({ message: 'No medical records found' });
    }
    res.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ 
      message: 'Error fetching medical records',
      error: error.message 
    });
  }
});
router.get('/recent', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }
  try {
    const records = await MedicalRecord.findAll({
      order: [['date', 'DESC']],
      limit: 10 
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching recent records:', error);
    res.status(500).json({
      message: 'Error fetching recent records',
      error: error.message
    });
  }
});
router.post('/create', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }
  try {
    const { patient_id, diagnosis, prescription, notes } = req.body;
    const record = await MedicalRecord.create({
      user_id: patient_id,
      date: new Date(),
      diagnosis,
      prescription,
      notes,
      doctor_name: `Dr. ${req.user.name}`
    });
    res.status(201).json({
      message: 'Medical record created successfully',
      record
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({
      message: 'Error creating medical record',
      error: error.message
    });
  }
});
router.delete('/delete/:id', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }
  try {
    const recordId = req.params.id; 
    const record = await MedicalRecord.findByPk(recordId);  
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    await record.destroy();
    res.json({ 
      message: 'Medical record deleted successfully',
      recordId
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({
      message: 'Error deleting medical record',
      error: error.message
    });
  }
});
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'dispecer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Dispatcher or admin only.' });
  }
  try {
    const [records] = await sequelize.query(`
      SELECT mr.id, mr.date as record_date, mr.diagnosis, mr.notes,
             p.email as patient_email,
             mr.doctor_name
      FROM medical_records mr
      LEFT JOIN users p ON mr.user_id = p.id
      ORDER BY mr.date DESC
    `);
    const formattedRecords = records.map(record => ({
      id: record.id,
      record_date: record.record_date,
      diagnosis: record.diagnosis,
      notes: record.notes,
      patient_name: record.patient_email ? record.patient_email.split('@')[0] : 'Unknown Patient',
      doctor_name: record.doctor_name || 'Unknown Doctor'
    }));
    res.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching all medical records:', error);
    res.status(500).json({ message: 'Error fetching medical records' });
  }
});
module.exports = router; 