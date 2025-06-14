const { sequelize } = require('../config/database');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const MedicalRecord = require('../models/medical_record');

async function generateTestData() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Get all patients and doctors
    const patients = await User.findAll({ where: { role: 'patient' } });
    const doctors = await User.findAll({ where: { role: 'doctor' } });

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

    if (patients.length === 0) {
      console.log('No patients found. Run add_sample_patients.js first.');
      return;
    }

    if (doctors.length === 0) {
      console.log('No doctors found. Please add doctors first.');
      return;
    }

    // Generate appointments
    await generateAppointments(patients, doctors);

    // Generate medical records
    await generateMedicalRecords(patients, doctors);

    // Generate medical tests
    await generateMedicalTests(patients, doctors);

    console.log('Test data generation complete.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

async function generateAppointments(patients, doctors) {
  console.log('Generating appointments...');
  
  // Check if appointments already exist
  const [appointmentResults] = await sequelize.query('SELECT COUNT(*) as count FROM appointments');
  const appointmentCount = appointmentResults[0].count;
  console.log(`Current appointment count: ${appointmentCount}`);
  
  if (appointmentCount > 0) {
    console.log('Appointments already exist, skipping...');
    return;
  }
  
  const appointmentStatuses = ['scheduled', 'completed', 'cancelled'];
  const reasons = [
    'Annual checkup',
    'Flu symptoms',
    'Lower back pain',
    'Headache and dizziness',
    'High blood pressure follow-up',
    'Vaccination',
    'Skin rash',
    'Digestive issues',
    'Respiratory problems',
    'Joint pain'
  ];
  
  // Create future and past dates for appointments
  const today = new Date();
  let createdCount = 0;
  
  // Create 20 appointments (mix of past, present, future)
  for (let i = 0; i < 20; i++) {
    try {
      // Randomly select a patient and doctor
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      // Set a random date (-30 to +30 days from today)
      const date = new Date(today);
      date.setDate(today.getDate() + Math.floor(Math.random() * 61) - 30);
      
      // Set a random time between 8am and 6pm
      const hour = 8 + Math.floor(Math.random() * 10);
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // 15 minute intervals
      
      // Set status based on date (past = completed/cancelled, future = scheduled)
      let status;
      if (date < today) {
        status = Math.random() < 0.8 ? 'completed' : 'cancelled'; // 80% completed, 20% cancelled
      } else {
        status = 'scheduled';
      }
      
      // Create the appointment
      await Appointment.create({
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: date.toISOString().split('T')[0],
        appointment_time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: status
      });
      
      createdCount++;
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  }
  
  console.log(`Created ${createdCount} appointments.`);
}

async function generateMedicalRecords(patients, doctors) {
  console.log('Generating medical records...');
  
  // Check if medical records already exist
  const [recordResults] = await sequelize.query('SELECT COUNT(*) as count FROM medical_records');
  const recordCount = recordResults[0].count;
  console.log(`Current medical records count: ${recordCount}`);
  
  if (recordCount > 0) {
    console.log('Medical records already exist, skipping...');
    return;
  }
  
  const diagnoses = [
    'Common Cold',
    'Hypertension',
    'Type 2 Diabetes',
    'Migraine',
    'Allergic Rhinitis',
    'Bronchitis',
    'Gastroenteritis',
    'Urinary Tract Infection',
    'Osteoarthritis',
    'Anxiety Disorder',
    'Iron Deficiency Anemia',
    'Vitamin D Deficiency',
    'GERD (Gastroesophageal Reflux Disease)',
    'Hypothyroidism',
    'Dermatitis'
  ];
  
  const prescriptions = [
    'Paracetamol 500mg, 1 tablet three times daily for 5 days',
    'Ibuprofen 400mg, 1 tablet twice daily after meals for 7 days',
    'Amoxicillin 500mg, 1 capsule three times daily for 7 days',
    'Loratadine 10mg, 1 tablet once daily for 14 days',
    'Omeprazole 20mg, 1 capsule before breakfast for 14 days',
    'Metformin 500mg, 1 tablet twice daily with meals',
    'Salbutamol inhaler, 2 puffs as needed for shortness of breath',
    'Levothyroxine 50mcg, 1 tablet daily on empty stomach',
    'Cetirizine 10mg, 1 tablet at bedtime for 7 days',
    'Vitamin D3 1000 IU, 1 tablet daily for 3 months'
  ];
  
  // Create past dates for medical records
  const today = new Date();
  let createdCount = 0;
  
  // Create medical records (all in the past)
  for (let i = 0; i < 25; i++) {
    try {
      // Randomly select a patient and doctor
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      // Set a random date in the past (between 1 and 365 days ago)
      const date = new Date(today);
      date.setDate(today.getDate() - Math.floor(Math.random() * 365) - 1);
      
      // Construct the doctor's name from profile
      const doctorProfile = await doctor.getUser_profile();
      const doctorName = `Dr. ${doctorProfile.first_name} ${doctorProfile.last_name}`;
      
      // Create medical record
      await sequelize.query(
        `INSERT INTO medical_records 
         (user_id, date, diagnosis, prescription, notes, doctor_name, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { 
          replacements: [
            patient.id,
            date.toISOString().split('T')[0],
            diagnoses[Math.floor(Math.random() * diagnoses.length)],
            Math.random() > 0.2 ? prescriptions[Math.floor(Math.random() * prescriptions.length)] : null,
            Math.random() > 0.5 ? `Patient notes from visit on ${date.toDateString()}` : null,
            doctorName
          ]
        }
      );
      
      createdCount++;
    } catch (error) {
      console.error('Error creating medical record:', error);
    }
  }
  
  console.log(`Created ${createdCount} medical records.`);
}

async function generateMedicalTests(patients, doctors) {
  console.log('Generating medical tests...');
  
  // Check if medical tests table exists
  try {
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'medical_tests'");
    if (tables.length === 0) {
      console.log('Medical tests table does not exist, skipping...');
      return;
    }
    
    // Check if medical tests already exist
    const [testResults] = await sequelize.query('SELECT COUNT(*) as count FROM medical_tests');
    const testCount = testResults[0].count;
    console.log(`Current medical tests count: ${testCount}`);
    
    if (testCount > 0) {
      console.log('Medical tests already exist, skipping...');
      return;
    }
    
    // Get column names from the medical_tests table
    const [columnsResult] = await sequelize.query("SHOW COLUMNS FROM medical_tests");
    const columnNames = columnsResult.map(col => col.Field);
    
    const testTypes = [
      'Complete Blood Count (CBC)',
      'Comprehensive Metabolic Panel',
      'Lipid Panel',
      'Thyroid Function Test',
      'Urinalysis',
      'Hemoglobin A1C',
      'Vitamin D Test',
      'Liver Function Test',
      'Electrocardiogram (ECG)',
      'X-Ray',
      'Ultrasound',
      'CT Scan',
      'MRI',
      'COVID-19 PCR Test',
      'Allergy Test'
    ];
    
    const testStatuses = ['pending', 'completed', 'cancelled'];
    
    // Create past and future dates for tests
    const today = new Date();
    let createdCount = 0;
    
    // Create medical tests
    for (let i = 0; i < 15; i++) {
      try {
        // Randomly select a patient and doctor
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        
        // Set a random date (-60 to +30 days from today)
        const date = new Date(today);
        date.setDate(today.getDate() + Math.floor(Math.random() * 91) - 60);
        
        const test_type = testTypes[Math.floor(Math.random() * testTypes.length)];
        
        // Set status based on date
        let status;
        let results = null;
        
        if (date < today) {
          // Past test
          status = Math.random() < 0.8 ? 'completed' : 'cancelled';
          // Only add results if completed
          if (status === 'completed') {
            results = Math.random() > 0.3 ? 
              `Results: ${test_type} - ${Math.random() > 0.7 ? 'Abnormal' : 'Normal'} values detected.` : 
              null;
          }
        } else {
          // Future test
          status = 'pending';
        }
        
        // Generate access code for test (random 6-character alphanumeric)
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let accessCode = '';
        for (let j = 0; j < 6; j++) {
          accessCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        const columnValues = {};
        
        // Set values based on column names
        if (columnNames.includes('patient_id')) columnValues.patient_id = patient.id;
        if (columnNames.includes('doctor_id')) columnValues.doctor_id = doctor.id;
        if (columnNames.includes('test_date')) 
          columnValues.test_date = date.toISOString().split('T')[0];
        if (columnNames.includes('test_type')) 
          columnValues.test_type = test_type;
        if (columnNames.includes('test_name')) 
          columnValues.test_name = test_type;
        if (columnNames.includes('test_category')) 
          columnValues.test_category = ['Blood', 'Imaging', 'Diagnostic', 'Screening'][Math.floor(Math.random() * 4)];
        if (columnNames.includes('status')) 
          columnValues.status = status;
        if (columnNames.includes('results')) 
          columnValues.results = results;
        if (columnNames.includes('access_code'))
          columnValues.access_code = accessCode;
        if (columnNames.includes('notes'))
          columnValues.notes = Math.random() > 0.7 ? `Notes for ${test_type}` : null;
        
        // Create the dynamic query
        const columnsStr = Object.keys(columnValues).join(', ');
        const placeholders = Object.keys(columnValues).map(() => '?').join(', ');
        const values = Object.values(columnValues);
        
        await sequelize.query(
          `INSERT INTO medical_tests (${columnsStr}, createdAt, updatedAt) 
           VALUES (${placeholders}, NOW(), NOW())`,
          { replacements: values }
        );
        
        createdCount++;
      } catch (error) {
        console.error('Error creating medical test:', error);
      }
    }
    
    console.log(`Created ${createdCount} medical tests.`);
  } catch (error) {
    console.error('Error with medical tests:', error);
  }
}

// Run the function
generateTestData(); 