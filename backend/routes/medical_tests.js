const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicalTest = require('../models/medical_test');
const TestParameter = require('../models/test_parameter');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const mysql = require('mysql2');
const dbConfig = require('../config/db.config');
sequelize.query(`
  CREATE TABLE IF NOT EXISTS visitor_medical_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id INT,
    doctor_id INT NOT NULL,
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(255),
    visitor_name VARCHAR(255),
    test_date DATE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(255) NOT NULL,
    notes TEXT,
    access_code VARCHAR(10) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
  )
`).then(() => {
  console.log('visitor_medical_tests table created or already exists');
}).catch(err => {
  console.error('Error creating visitor_medical_tests table:', err);
});
sequelize.query(`
  CREATE TABLE IF NOT EXISTS visitor_test_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    value FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    min_reference FLOAT,
    max_reference FLOAT,
    is_normal BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES visitor_medical_tests(id) ON DELETE CASCADE
  )
`).then(() => {
  console.log('visitor_test_parameters table created or already exists');
}).catch(err => {
  console.error('Error creating visitor_test_parameters table:', err);
});
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot adăuga analize medicale.' });
    }
    const { patientId, testDate, testName, testCategory, notes, parameters } = req.body;
    if (!patientId || !testDate || !testName || !testCategory || !parameters || !Array.isArray(parameters) || parameters.length === 0) {
      return res.status(400).json({ message: 'Date incomplete. Vă rugăm completați toate câmpurile obligatorii.' });
    }
    const isVisitor = patientId.toString().startsWith('visitor_');
    let visitorId = null;
    const generateAccessCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    const accessCode = generateAccessCode();
    if (isVisitor) {
      visitorId = patientId.toString().replace('visitor_', '');
      console.log("Getting visitor details for ID:", visitorId);
      const visitor = await sequelize.query(
        `SELECT "firstName", "lastName", "email", "phone" FROM "visitor_appointments" WHERE "id" = :visitorId`,
        { 
          replacements: { visitorId },
          type: QueryTypes.SELECT
        }
      );
      console.log("Visitor query result:", visitor);
      if (visitor && visitor.length > 0) {
        const [visitorTestResult] = await sequelize.query(
          `INSERT INTO visitor_medical_tests 
          (visitor_id, doctor_id, visitor_email, visitor_phone, visitor_name, test_date, test_name, test_category, notes, access_code) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              visitorId,
              req.user.userId,
              visitor[0].email,
              visitor[0].phone,
              `${visitor[0].firstName} ${visitor[0].lastName}`,
              testDate,
              testName,
              testCategory,
              notes || null,
              accessCode
            ],
            type: QueryTypes.INSERT
          }
        );
        const visitorTestId = visitorTestResult;
        const testParams = [];
        for (const param of parameters) {
          let isNormal = true;
          if (param.minReference !== null && param.maxReference !== null) {
            isNormal = param.value >= param.minReference && param.value <= param.maxReference;
          }
          await sequelize.query(
            `INSERT INTO visitor_test_parameters 
            (test_id, parameter_name, value, unit, min_reference, max_reference, is_normal) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                visitorTestId,
                param.name,
                param.value,
                param.unit,
                param.minReference || null,
                param.maxReference || null,
                isNormal
              ],
              type: QueryTypes.INSERT
            }
          );
          testParams.push({
            parameter_name: param.name,
            value: param.value,
            unit: param.unit,
            min_reference: param.minReference,
            max_reference: param.maxReference,
            is_normal: isNormal
          });
        }
        res.status(201).json({
          message: 'Analiză medicală adăugată cu succes',
          medicalTest: {
            id: visitorTestId,
            test_date: testDate,
            test_name: testName,
            test_category: testCategory,
            notes: notes
          },
          parameters: testParams,
          accessCode: accessCode,
          patientDetails: {
            name: `${visitor[0].firstName} ${visitor[0].lastName}`,
            email: visitor[0].email,
            phone: visitor[0].phone
          }
        });
      } else {
        return res.status(404).json({ message: 'Visitor not found' });
      }
    } else {
      const medicalTest = await MedicalTest.create({
        patient_id: patientId,
        doctor_id: req.user.userId,
        test_date: testDate,
        test_name: testName,
        test_category: testCategory,
        notes: notes,
        access_code: accessCode
      });
      const testParams = [];
      for (const param of parameters) {
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
    }
  } catch (error) {
    console.error('Eroare la adăugarea analizei medicale:', error);
    res.status(500).json({ message: 'Eroare la adăugarea analizei medicale', error: error.message });
  }
});
router.get('/my-tests', auth, async (req, res) => {
  try {
    const patientId = req.user.userId;
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
    res.status(500).json({ message: 'Eroare la obținerea analizelor medicale', error: error.message });
  }
});
router.get('/my-tests/:testId', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const patientId = req.user.userId; 
    const medicalTest = await MedicalTest.findOne({
      where: { 
        id: testId,
        patient_id: patientId
      },
      include: [
        { model: TestParameter }
      ]
    });
    if (!medicalTest) {
      return res.status(404).json({ message: 'Analiza medicală nu a fost găsită' });
    }
    res.json(medicalTest);
  } catch (error) {
    console.error('Eroare la obținerea analizei medicale:', error);
    res.status(500).json({ message: 'Eroare la obținerea analizei medicale', error: error.message });
  }
});
router.get('/access/:accessCode', async (req, res) => {
  try {
    const { accessCode } = req.params; 
    if (!accessCode) {
      return res.status(400).json({ message: 'Codul de acces este obligatoriu' });
    }
    const medicalTest = await MedicalTest.findOne({
      where: { access_code: accessCode },
      include: [
        { model: TestParameter }
      ]
    });
    if (medicalTest) {
      return res.json(medicalTest);
    }
    const [visitorTest] = await sequelize.query(
      `SELECT * FROM visitor_medical_tests WHERE access_code = ?`,
      {
        replacements: [accessCode],
        type: QueryTypes.SELECT
      }
    );
    if (!visitorTest) {
      return res.status(404).json({ message: 'Test medical negăsit. Verificați codul de acces.' });
    }
    const [visitorParams] = await sequelize.query(
      `SELECT * FROM visitor_test_parameters WHERE test_id = ?`,
      {
        replacements: [visitorTest.id],
        type: QueryTypes.SELECT,
        nest: true
      }
    );
    const formattedTest = {
      ...visitorTest,
      test_parameters: visitorParams || []
    };
    res.json(formattedTest);
  } catch (error) {
    console.error('Eroare la obținerea testului medical:', error);
    res.status(500).json({ message: 'Eroare la obținerea testului medical' });
  }
});
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params; 
    if (req.user.role !== 'doctor' && req.user.userId != patientId) {
      return res.status(403).json({ message: 'Acces interzis. Puteți vizualiza doar propriile analize medicale.' });
    }
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
    if (req.user.role !== 'doctor' && req.user.userId != medicalTest.patient_id) {
      return res.status(403).json({ message: 'Acces interzis. Puteți vizualiza doar propriile analize medicale.' });
    }
    res.json(medicalTest);
  } catch (error) {
    console.error('Eroare la obținerea analizei medicale:', error);
    res.status(500).json({ message: 'Eroare la obținerea analizei medicale' });
  }
});
router.put('/:testId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot actualiza analize medicale.' });
    }
    const { testId } = req.params;
    const { testDate, testName, testCategory, notes, parameters } = req.body;
    const medicalTest = await MedicalTest.findByPk(testId);
    if (!medicalTest) {
      return res.status(404).json({ message: 'Analiza medicală nu a fost găsită' });
    }
    if (medicalTest.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Acces interzis. Puteți actualiza doar analizele adăugate de dvs.' });
    }
    if (testDate) medicalTest.test_date = testDate;
    if (testName) medicalTest.test_name = testName;
    if (testCategory) medicalTest.test_category = testCategory;
    if (notes !== undefined) medicalTest.notes = notes;
    await medicalTest.save();
    if (parameters && Array.isArray(parameters)) {
      await TestParameter.destroy({ where: { test_id: testId } });
      for (const param of parameters) {
        let isNormal = true;
        if (param.minReference !== null && param.maxReference !== null) {
          isNormal = param.value >= param.minReference && param.value <= param.maxReference;
        }
        await TestParameter.create({
          test_id: testId,
          parameter_name: param.name,
          value: param.value,
          unit: param.unit,
          min_reference: param.minReference,
          max_reference: param.maxReference,
          is_normal: isNormal
        });
      }
    }
    const updatedTest = await MedicalTest.findByPk(testId, {
      include: [
        { model: TestParameter }
      ]
    });
    res.json({
      message: 'Analiză medicală actualizată cu succes',
      medicalTest: updatedTest
    });
  } catch (error) {
    console.error('Eroare la actualizarea analizei medicale:', error);
    res.status(500).json({ message: 'Eroare la actualizarea analizei medicale' });
  }
});
router.delete('/:testId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis. Doar medicii pot șterge analize medicale.' });
    }
    const { testId } = req.params;
    const medicalTest = await MedicalTest.findByPk(testId);
    if (!medicalTest) {
      return res.status(404).json({ message: 'Analiza medicală nu a fost găsită' });
    }
    if (medicalTest.doctor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Acces interzis. Puteți șterge doar analizele adăugate de dvs.' });
    }
    await medicalTest.destroy();
    res.json({ message: 'Analiză medicală ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea analizei medicale:', error);
    res.status(500).json({ message: 'Eroare la ștergerea analizei medicale' });
  }
});
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'dispecer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Dispatcher or admin only.' });
  }
  try {
    const [tests] = await sequelize.query(`
      SELECT mt.id, mt.test_date, mt.test_type, mt.status, mt.results,
             p.email as patient_email
      FROM medical_tests mt
      LEFT JOIN users p ON mt.patient_id = p.id
      ORDER BY mt.test_date DESC
    `);
    const formattedTests = tests.map(test => ({
      id: test.id,
      test_date: test.test_date,
      test_type: test.test_type,
      status: test.status,
      results: test.results,
      patient_name: test.patient_email ? test.patient_email.split('@')[0] : 'Unknown Patient'
    }));
    res.json(formattedTests);
  } catch (error) {
    console.error('Error fetching all medical tests:', error);
    res.status(500).json({ message: 'Error fetching medical tests' });
  }
});
module.exports = router; 