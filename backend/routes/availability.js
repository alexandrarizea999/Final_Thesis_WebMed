const express = require('express');
const router = express.Router();
const DoctorAvailability = require('../models/doctor_availability');
const auth = require('../middleware/auth');

// GET /availability/all - Obține toate disponibilitățile
// Necesită autentificare
router.get('/all', auth, async (req, res) => {
  try {
    const availability = await DoctorAvailability.findAll();
    res.json(availability);
  } catch (error) {
    console.error('Error fetching all availability:', error);
    res.status(500).json({ message: 'Error fetching all availability' });
  }
});

// GET /availability/:doctorId - Obține disponibilitatea unui doctor specific
// Necesită autentificare
router.get('/:doctorId', auth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    console.log('Fetching availability for doctor ID:', doctorId);
    
    // Verificăm dacă avem ID-ul doctorului
    if (!doctorId) {
      return res.status(400).json({ 
        message: 'Doctor ID is required',
        requiredId: doctorId
      });
    }

    // Căutăm toate înregistrările de disponibilitate pentru doctorul specificat
    const availability = await DoctorAvailability.findAll({
      where: { doctor_id: doctorId }
    }); 
    console.log(`Found ${availability.length} availability records for doctor ${doctorId}`);
    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Error fetching availability' });
  }
});

// POST /availability/set - Setează programul de disponibilitate al unui doctor
// Necesită autentificare și rol de doctor
router.post('/set', auth, async (req, res) => {
  // Verificăm dacă utilizatorul este doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }

  try {
    let availabilityData = req.body.availabilityData;

    // Procesăm datele în format alternativ dacă există
    if (!availabilityData && req.body.schedule) {
      availabilityData = [];
      for (const day in req.body.schedule) {
        availabilityData.push({
          day_of_week: day,
          is_available: true,
          start_time: req.body.schedule[day].start,
          end_time: req.body.schedule[day].end
        });
      }
    }

    // Validăm datele primite
    if (!availabilityData || !Array.isArray(availabilityData) || availabilityData.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid availability data format',
        receivedBody: req.body
      });
    }

    // Obținem ID-ul doctorului din token sau din body
    const doctorId = req.body.doctor_id || req.user.userId;
    if (!doctorId) {
      return res.status(400).json({ 
        message: 'Doctor ID is required',
        user: req.user,
        body: req.body
      });
    }

    console.log(`Setting availability for doctor ${doctorId}, ${availabilityData.length} slots`);

    // Ștergem disponibilitățile existente
    await DoctorAvailability.destroy({
      where: { doctor_id: doctorId }
    });

    // Creăm noile înregistrări de disponibilitate
    const availability = await DoctorAvailability.bulkCreate(
      availabilityData.map(slot => ({
        doctor_id: doctorId,
        ...slot
      }))
    );

    console.log(`Successfully created ${availability.length} availability records`); 
    res.status(201).json({
      message: 'Availability set successfully',
      doctorId: doctorId,
      count: availability.length,
      availability
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ 
      message: 'Error setting availability',
      error: error.message
    });
  }
});

// PATCH /availability/:id - Actualizează o înregistrare specifică de disponibilitate
// Necesită autentificare și rol de doctor
router.patch('/:id', auth, async (req, res) => {
  // Verificăm dacă utilizatorul este doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }

  try {
    // Găsim înregistrarea de disponibilitate
    const slot = await DoctorAvailability.findByPk(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    // Verificăm dacă doctorul modifică propria disponibilitate
    if (slot.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Actualizăm înregistrarea
    await slot.update(req.body);
    res.json(slot);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Error updating availability' });
  }
});

// DELETE /availability/clear/:doctorId - Șterge toate înregistrările de disponibilitate ale unui doctor
// Necesită autentificare
router.delete('/clear/:doctorId', auth, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Verificăm dacă avem ID-ul doctorului
    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    // Verificăm dacă doctorul șterge propria disponibilitate
    if (req.user.role === 'doctor' && req.user.userId != doctorId) {
      return res.status(403).json({ message: 'You can only clear your own availability' });
    }

    // Ștergem toate înregistrările de disponibilitate
    const deleted = await DoctorAvailability.destroy({
      where: { doctor_id: doctorId }
    });    
    console.log(`Deleted ${deleted} availability records for doctor ${doctorId}`); 
    
    res.json({ 
      message: 'Availability cleared successfully',
      count: deleted
    });
  } catch (error) {
    console.error('Error clearing availability:', error);
    res.status(500).json({ message: 'Error clearing availability' });
  }
});

// Exportăm router-ul pentru a fi folosit în aplicație
module.exports = router; 