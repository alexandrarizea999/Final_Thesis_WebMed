const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/appointment');
const DoctorAvailability = require('../models/doctor_availability');
const { Op } = require('sequelize');
const mysql = require('mysql2');
const dbConfig = require('../config/db.config');
const { sequelize } = require('../config/database');

// Rută pentru verificarea sloturilor disponibile pentru programări
// Primește: doctorId și data dorită
// Returnează: lista de sloturi disponibile de 30 minute
router.get('/available-slots', auth, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId) {
      console.error('Missing doctorId in request:', req.query);
      return res.status(400).json({ message: 'Doctor ID is required' });
    }
    if (!date) {
      console.error('Missing date in request:', req.query);
      return res.status(400).json({ message: 'Date is required' });
    }

    console.log(`Checking availability for doctor ${doctorId} on date ${date}`);
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Determină ziua săptămânii pentru verificarea disponibilității doctorului
    const dayOfWeek = appointmentDate.toLocaleString('en-US', { weekday: 'long' });
    console.log(`The day of week is: ${dayOfWeek}`);

    // Verifică dacă doctorul lucrează în ziua respectivă
    const availability = await DoctorAvailability.findOne({
      where: {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        is_available: true
      }
    });

    console.log(`Availability for doctor ${doctorId} on ${dayOfWeek}:`, availability ? 'Available' : 'Not available');
    if (!availability) {
      return res.json([]);
    }

    // Găsește toate programările existente pentru ziua respectivă
    const bookedAppointments = await Appointment.findAll({
      where: {
        doctor_id: doctorId,
        appointment_date: date,
        status: 'scheduled'
      }
    });

    console.log(`Found ${bookedAppointments.length} booked appointments for doctor ${doctorId} on ${date}`);

    // Generează toate sloturile disponibile la intervale de 30 minute
    const slots = [];
    const startTime = new Date(`2000-01-01T${availability.start_time}`);
    const endTime = new Date(`2000-01-01T${availability.end_time}`);

    for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 30)) {
      const timeString = time.toTimeString().slice(0, 8);
      const isBooked = bookedAppointments.some(apt =>
        apt.appointment_time === timeString
      );
      if (!isBooked) {
        slots.push({ time: timeString });
      }
    }

    console.log(`Returning ${slots.length} available slots`);
    res.json(slots);
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ 
      message: 'Error getting available slots',
      error: error.message 
    });
  }
});

// Rută pentru crearea unei noi programări
// Primește: doctorId, data, ora și motivul programării
// Returnează: detaliile programării create
router.post('/book', auth, async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    // Verifică dacă slotul este încă disponibil (pentru a evita suprapunerile)
    const existingAppointment = await Appointment.findOne({
      where: {
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        status: 'scheduled'
      }
    });
    if (existingAppointment) {
      return res.status(400).json({ message: 'This slot is no longer available' });
    }

    // Creează noua programare în baza de date
    const appointment = await Appointment.create({
      patient_id: req.user.userId,
      doctor_id: doctorId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      reason: reason,
      status: 'scheduled'
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Error booking appointment' });
  }
});

// Rută pentru vizualizarea tuturor programărilor unui utilizator
// Returnează: toate programările în care utilizatorul este pacient sau doctor
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: {
        [Op.or]: [
          { patient_id: req.user.userId },
          { doctor_id: req.user.userId }
        ]
      },
      order: [
        ['appointment_date', 'ASC'],
        ['appointment_time', 'ASC']
      ]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Rută pentru vizualizarea programărilor unui doctor
// Accesibilă doar pentru doctori
// Returnează: programările viitoare ale doctorului
router.get('/doctor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can view their appointments.' });
    }

    const appointments = await Appointment.findAll({
      where: { 
        doctor_id: req.user.userId,
        appointment_date: {
          [Op.gte]: new Date().toISOString().split('T')[0] // Doar programări din ziua curentă sau viitoare
        }
      },
      order: [
        ['appointment_date', 'ASC'],
        ['appointment_time', 'ASC']
      ]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Rută pentru marcarea unei programări ca finalizată
// Accesibilă doar pentru doctori
// Adaugă și puncte de loialitate pentru pacient
router.put('/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can complete appointments.' });
    }

    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to complete this appointment' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Cannot complete a cancelled appointment' });
    }

    // Marchează programarea ca finalizată
    appointment.status = 'completed';
    await appointment.save();

    // Adaugă puncte de loialitate pentru pacient
    const POINTS_PER_APPOINTMENT = 10;
    const LoyaltyCard = require('../models/loyalty_card');
    
    // Găsește sau creează cardul de loialitate al pacientului
    let loyaltyCard = await LoyaltyCard.findOne({
      where: { patient_id: appointment.patient_id }
    });

    if (!loyaltyCard) {
      loyaltyCard = await LoyaltyCard.create({
        patient_id: appointment.patient_id,
        points: POINTS_PER_APPOINTMENT,
        total_earned_points: POINTS_PER_APPOINTMENT
      });
    } else {
      loyaltyCard.points += POINTS_PER_APPOINTMENT;
      loyaltyCard.total_earned_points += POINTS_PER_APPOINTMENT;
      await loyaltyCard.save();
    }

    res.json({ 
      message: 'Appointment marked as completed',
      loyalty_points_added: POINTS_PER_APPOINTMENT,
      loyalty_card: loyaltyCard
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: 'Error completing appointment' });
  }
});

// Rută pentru anularea unei programări
// Accesibilă atât pentru pacient cât și pentru doctor
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.patient_id !== req.user.userId && appointment.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Cannot cancel a completed or already cancelled appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

// Rută pentru respingerea unei programări de către doctor
// Accesibilă doar pentru doctori
router.put('/:id/decline', auth, async (req, res) => {
  try {
    console.log('Decline appointment request received. ID:', req.params.id);
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can decline appointments.' });
    }

    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      console.log('Appointment not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Found appointment:', appointment.id, 'doctor_id:', appointment.doctor_id, 'current user:', req.user.userId);
    if (appointment.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to decline this appointment' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Cannot decline a completed or already cancelled appointment' });
    }

    appointment.status = 'declined';
    await appointment.save();
    console.log('Appointment successfully declined');
    res.json({ message: 'Appointment declined successfully' });
  } catch (error) {
    console.error('Error declining appointment:', error);
    res.status(500).json({ message: 'Error declining appointment' });
  }
});

// Rută alternativă pentru respingerea programării (metoda POST)
router.post('/:id/decline', auth, async (req, res) => {
  try {
    console.log('POST Decline appointment request received. ID:', req.params.id);
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can decline appointments.' });
    }

    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      console.log('Appointment not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Found appointment:', appointment.id, 'doctor_id:', appointment.doctor_id, 'current user:', req.user.userId);
    if (appointment.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to decline this appointment' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Cannot decline a completed or already cancelled appointment' });
    }

    appointment.status = 'declined';
    await appointment.save();
    console.log('Appointment successfully declined (POST)');
    res.json({ message: 'Appointment declined successfully' });
  } catch (error) {
    console.error('Error declining appointment:', error);
    res.status(500).json({ message: 'Error declining appointment' });
  }
});

// Rută alternativă pentru anularea programării (metoda POST)
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.patient_id !== req.user.userId && appointment.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Cannot cancel a completed or already cancelled appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

// Rută pentru vizualizarea programărilor viitoare
// Returnează: programările viitoare pentru pacient sau doctor
router.get('/upcoming', auth, async (req, res) => {
  try {
    console.log(`Fetching upcoming appointments for user ID: ${req.user.userId}, role: ${req.user.role}`);
    const appointments = await Appointment.findAll({
      where: { 
        [Op.or]: [
          { patient_id: req.user.userId },
          { doctor_id: req.user.userId }
        ],
        appointment_date: {
          [Op.gte]: new Date().toISOString().split('T')[0] // Doar programări din ziua curentă sau viitoare
        }
      },
      order: [
        ['appointment_date', 'ASC'],
        ['appointment_time', 'ASC']
      ]
    });

    console.log(`Found ${appointments.length} upcoming appointments`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ message: 'Error fetching upcoming appointments' });
  }
});

// Rută pentru vizualizarea tuturor programărilor (pentru dispeceri și admini)
// Returnează: toate programările din sistem cu detalii despre pacienți și doctori
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'dispecer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Dispatcher or admin only.' });
  }

  try {
    // Interogare complexă pentru a obține detalii despre programări, pacienți și doctori
    const [appointments] = await sequelize.query(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason as notes,
             p.email as patient_email, 
             d.email as doctor_email
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC
    `);

    // Formatează datele pentru afișare (extrage numele din email-uri)
    const formattedAppointments = appointments.map(app => ({
      id: app.id,
      appointment_date: app.appointment_date,
      status: app.status,
      notes: app.notes,
      patient_name: app.patient_email ? app.patient_email.split('@')[0] : 'Unknown Patient',
      doctor_name: app.doctor_email ? app.doctor_email.split('@')[0] : 'Unknown Doctor'
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

module.exports = router; 