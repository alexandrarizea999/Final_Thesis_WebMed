const express = require('express');
const router = express.Router();
const VisitorAppointment = require('../models/visitor_appointment');
const User = require('../models/user');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, specialty, preferredDate, notes } = req.body;
    if (!firstName || !lastName || !email || !phone || !specialty || !preferredDate) {
      return res.status(400).json({ message: 'Toate câmpurile obligatorii trebuie completate' });
    }
    const appointment = await VisitorAppointment.create({
      firstName,
      lastName,
      email,
      phone,
      specialty,
      preferredDate,
      notes,
      status: 'pending',
      processed: false
    });
    res.status(201).json({
      message: 'Programarea a fost înregistrată cu succes.',
      appointmentId: appointment.id,
      confirmationCode: generateConfirmationCode(appointment.id)
    });
  } catch (error) {
    console.error('Error creating visitor appointment:', error);
    res.status(500).json({ 
      message: 'A apărut o eroare la înregistrarea programării.',
      error: error.message 
    });
  }
});
router.get('/status/:appointmentId/:confirmationCode', async (req, res) => {
  try {
    const { appointmentId, confirmationCode } = req.params;
    const expectedCode = generateConfirmationCode(parseInt(appointmentId));
    if (confirmationCode !== expectedCode) {
      return res.status(400).json({ message: 'Cod de confirmare invalid.' });
    }
    const appointment = await VisitorAppointment.findByPk(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }
    res.json({
      appointment: {
        id: appointment.id,
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        specialty: appointment.specialty,
        preferredDate: appointment.preferredDate,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Error fetching appointment status:', error);
    res.status(500).json({ message: 'Eroare la verificarea programării.' });
  }
});
router.post('/confirm/:appointmentId/:confirmationCode', async (req, res) => {
  try {
    const { appointmentId, confirmationCode } = req.params;
    const expectedCode = generateConfirmationCode(parseInt(appointmentId));
    if (confirmationCode !== expectedCode) {
      return res.status(400).json({ message: 'Cod de confirmare invalid.' });
    }
    const appointment = await VisitorAppointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }
    
    if (appointment.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Programarea a fost deja procesată.',
        status: appointment.status
      });
    }
    appointment.status = 'confirmed';
    await appointment.save();
    res.json({
      message: 'Programarea a fost confirmată cu succes.',
      appointment: {
        id: appointment.id,
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        specialty: appointment.specialty,
        preferredDate: appointment.preferredDate,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ message: 'Eroare la confirmarea programării.' });
  }
});
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot vedea programările vizitatorilor.' });
    }
    const { status, processed } = req.query;
    const filters = {};
    if (status) {
      filters.status = status;
    }
    if (processed !== undefined) {
      filters.processed = processed === 'true';
    }
    const appointments = await VisitorAppointment.findAll({
      where: filters,
      order: [['createdAt', 'DESC']]
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching visitor appointments:', error);
    res.status(500).json({ message: 'Eroare la obținerea programărilor' });
  }
});
router.put('/:id/process', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot procesa programările.' });
    }
    const { status, message } = req.body;
    const appointmentId = req.params.id;
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status invalid. Valorile permise sunt: confirmed, cancelled' });
    }
    const appointment = await VisitorAppointment.findByPk(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită' });
    }
    appointment.status = status;
    appointment.processed = true;
    await appointment.save();
    
    res.json({
      message: 'Programarea a fost procesată cu succes',
      appointment
    });
  } catch (error) {
    console.error('Error processing visitor appointment:', error);
    res.status(500).json({ message: 'Eroare la procesarea programării' });
  }
});
router.get('/for-doctor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot accesa această resursă.' });
    }
    const visitors = await VisitorAppointment.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      group: ['id', 'firstName', 'lastName', 'email', 'phone'], 
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    const formattedVisitors = visitors.map(visitor => ({
      id: `visitor_${visitor.id}`,
      first_name: visitor.firstName,
      last_name: visitor.lastName,
      email: visitor.email,
      phone_number: visitor.phone,
      is_visitor: true
    }));
    console.log("Returning visitors:", formattedVisitors);
    res.json(formattedVisitors);
  } catch (error) {
    console.error('Eroare la obținerea vizitatorilor:', error);
    res.status(500).json({ message: 'Eroare internă server', error: error.message });
  }
});
function generateConfirmationCode(appointmentId) {
  const code = Buffer.from(`webmed-${appointmentId}-${process.env.JWT_SECRET || 'your-secret-key'}`).toString('base64')
    .replace(/=/g, '')  
    .replace(/\+/g, '-') 
    .replace(/\//g, '_'); 
  return code.substring(0, 12);
}
module.exports = router; 