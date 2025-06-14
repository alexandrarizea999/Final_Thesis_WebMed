const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicalTest = require('../models/medical_test');
const TestParameter = require('../models/test_parameter');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Adaugă o analiză medicală nouă cu parametri (doar medic)
router.post('/', auth, async (req, res) => {
  try {
    // Verificare permisiuni (doar medicii pot adăuga analize)
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot adăuga analize medicale.' });
    }

    const { patientId, testDate, testName, testCategory, notes, parameters } = req.body;

    // Verificare date primite
    if (!patientId || !testDate || !testName || !testCategory || !parameters || !Array.isArray(parameters) || parameters.length === 0) {
      return res.status(400).json({ message: 'Date incomplete. Vă rugăm completați toate câmpurile obligatorii.' });
    }

    // Pentru verificare existentă prefix "visitor_" - nu mai acceptăm vizitatori
    if (String(patientId).startsWith('visitor_')) {
      return res.status(400).json({ 
        message: 'Nu se pot adăuga analize pentru vizitatori. Vă rugăm selectați un pacient înregistrat.' 
      });
    }

    // Generează un cod unic de acces pentru test (8 caractere alfanumerice)
    const generateAccessCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const accessCode = generateAccessCode();
    
    // Creare analiză medicală doar pentru pacienți înregistrați
    const medicalTest = await MedicalTest.create({
      patient_id: patientId,
      doctor_id: req.user.userId,
      test_date: testDate,
      test_name: testName,
      test_category: testCategory,
      notes: notes,
      access_code: accessCode
    });

    // Adăugare parametri
    const testParams = [];
    for (const param of parameters) {
      // Verificare dacă valoarea este în intervalul normal
      let isNormal = true;
      if (param.minReference !== null && param.maxReference !== null) {
        isNormal = param.value >= param.minReference && param.value <= param.maxReference;
      }

      const testParam = await TestParameter.create({
        test_id: medicalTest.id,
        parameter_name: param.name,
        value: param.value,
        unit: param.unit,
        min_reference: param.minReference,
        max_reference: param.maxReference,
        is_normal: isNormal
      });
      testParams.push(testParam);
    }

    res.status(201).json({
      message: 'Analiză medicală adăugată cu succes',
      medicalTest,
      parameters: testParams,
      accessCode: accessCode
    });
  } catch (error) {
    console.error('Eroare la adăugarea analizei medicale:', error);
    res.status(500).json({ message: 'Eroare la adăugarea analizei medicale', error: error.message });
  }
});

// Obține toate analizele unui pacient (pentru pacient sau medic)
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verificare permisiuni (pacientul poate vedea doar analizele proprii, medicul poate vedea analizele oricărui pacient)
    if (req.user.role !== 'doctor' && req.user.userId != patientId) {
      return res.status(403).json({ message: 'Acces interzis. Puteți vizualiza doar propriile analize medicale.' });
    }

    // Obține analizele medicale
    const medicalTests = await MedicalTest.findAll({
      where: { patient_id: patientId },
      order: [['test_date', 'DESC']],
      include: [
        { model: TestParameter }
      ]
    });

    res.json(medicalTests);
  } catch (error) {
    console.error('Eroare la obținerea analizelor medicale:', error);
    res.status(500).json({ message: 'Eroare la obținerea analizelor medicale' });
  }
});

// Obține o analiză specifică cu toți parametrii (pentru pacient sau medic)
router.get('/:testId', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    
    const medicalTest = await MedicalTest.findByPk(testId, {
      include: [
        { model: TestParameter }
      ]
    });

    if (!medicalTest) {
      return res.status(404).json({ message: 'Analiza medicală nu a fost găsită' });
    }

    // Verificare permisiuni
    if (req.user.role !== 'doctor' && req.user.userId != medicalTest.patient_id) {
      return res.status(403).json({ message: 'Acces interzis. Puteți vizualiza doar propriile analize medicale.' });
    }

    res.json(medicalTest);
  } catch (error) {
    console.error('Eroare la obținerea analizei medicale:', error);
    res.status(500).json({ message: 'Eroare la obținerea analizei medicale' });
  }
});

// Obține o analiză folosind codul de acces (pentru pacienți fără autentificare)
router.get('/access/:accessCode', async (req, res) => {
  try {
    const { accessCode } = req.params;
    
    if (!accessCode) {
      return res.status(400).json({ message: 'Codul de acces este obligatoriu' });
    }
    
    // Căutăm doar în tabela pentru pacienți înregistrați
    const medicalTest = await MedicalTest.findOne({
      where: { access_code: accessCode },
      include: [
        { model: TestParameter }
      ]
    });

    if (!medicalTest) {
      return res.status(404).json({ message: 'Test medical negăsit. Verificați codul de acces.' });
    }

    res.json(medicalTest);
  } catch (error) {
    console.error('Eroare la obținerea testului medical:', error);
    res.status(500).json({ message: 'Eroare la obținerea testului medical' });
  }
});

module.exports = router; 