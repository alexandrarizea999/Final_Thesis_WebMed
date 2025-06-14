const { sequelize } = require('../config/database');
const User = require('../models/user');
const Appointment = require('../models/appointment');

async function insertTestData() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Get users with patient and doctor roles
    const patients = await User.findAll({ where: { role: 'patient' } });
    const doctors = await User.findAll({ where: { role: 'doctor' } });
    
    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);
    
    if (patients.length === 0 || doctors.length === 0) {
      console.log('Need at least one patient and one doctor to create test data.');
      return;
    }

    // Create test appointments
    const [appointmentResults] = await sequelize.query('SELECT COUNT(*) as count FROM appointments');
    const appointmentCount = appointmentResults[0].count;
    console.log(`Current appointment count: ${appointmentCount}`);
    
    if (appointmentCount < 5) {
      console.log('Creating test appointments...');
      
      const appointmentStatuses = ['scheduled', 'completed', 'cancelled'];
      const today = new Date();
      
      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + Math.floor(Math.random() * 30) - 15);
        
        const appointmentDate = date.toISOString().split('T')[0];
        const hour = 8 + Math.floor(Math.random() * 9);
        const appointmentTime = `${hour}:00:00`;
        
        await Appointment.create({
          patient_id: patients[Math.floor(Math.random() * patients.length)].id,
          doctor_id: doctors[Math.floor(Math.random() * doctors.length)].id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason: `Test appointment ${i + 1}`,
          status: appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)]
        });
      }
      
      console.log('Test appointments created.');
    }
    
    // Check if medical_records table exists
    try {
      const [tables] = await sequelize.query("SHOW TABLES LIKE 'medical_records'");
      
      if (tables.length > 0) {
        // Create test medical records
        const [recordResults] = await sequelize.query('SELECT COUNT(*) as count FROM medical_records');
        const recordCount = recordResults[0].count;
        console.log(`Current medical record count: ${recordCount}`);
        
        if (recordCount < 5) {
          console.log('Creating test medical records...');
          
          const diagnoses = [
            'Flu', 'Common Cold', 'Hypertension', 'Diabetes', 
            'Allergic Rhinitis', 'Migraine', 'Bronchitis'
          ];
          
          // Check table structure
          const [columns] = await sequelize.query('DESCRIBE medical_records');
          console.log('Medical records table structure:', columns.map(c => c.Field));
          
          // Build dynamic query based on actual columns
          const columnNames = columns.map(c => c.Field).filter(
            name => !['id', 'createdAt', 'updatedAt'].includes(name)
          );
          
          for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            const patientId = patients[Math.floor(Math.random() * patients.length)].id;
            const doctorId = doctors[Math.floor(Math.random() * doctors.length)].id;
            
            const columnValues = {};
            
            // Set values based on column names
            if (columnNames.includes('patient_id')) columnValues.patient_id = patientId;
            if (columnNames.includes('user_id')) columnValues.user_id = patientId;
            if (columnNames.includes('doctor_id')) columnValues.doctor_id = doctorId;
            if (columnNames.includes('record_date')) 
              columnValues.record_date = date.toISOString().split('T')[0];
            if (columnNames.includes('date')) 
              columnValues.date = date.toISOString().split('T')[0];
            if (columnNames.includes('diagnosis')) 
              columnValues.diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            if (columnNames.includes('notes')) 
              columnValues.notes = `Medical record notes for record ${i + 1}`;
            if (columnNames.includes('doctor_name')) 
              columnValues.doctor_name = `Dr. Test Doctor`;
            
            // Create the dynamic query
            const columnsStr = Object.keys(columnValues).join(', ');
            const placeholders = Object.keys(columnValues).map(() => '?').join(', ');
            const values = Object.values(columnValues);
            
            await sequelize.query(
              `INSERT INTO medical_records (${columnsStr}, createdAt, updatedAt) 
               VALUES (${placeholders}, NOW(), NOW())`,
              { replacements: values }
            );
          }
          
          console.log('Test medical records created.');
        }
      } else {
        console.log('Medical records table does not exist, skipping...');
      }
    } catch (err) {
      console.error('Error with medical records:', err);
    }
    
    // Check if medical_tests table exists
    try {
      const [tables] = await sequelize.query("SHOW TABLES LIKE 'medical_tests'");
      
      if (tables.length > 0) {
        // Create test medical tests
        const [testResults] = await sequelize.query('SELECT COUNT(*) as count FROM medical_tests');
        const testCount = testResults[0].count;
        console.log(`Current medical test count: ${testCount}`);
        
        if (testCount < 5) {
          console.log('Creating test medical tests...');
          
          const testTypes = ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan'];
          const testStatuses = ['pending', 'completed', 'cancelled'];
          
          // Check table structure
          const [columns] = await sequelize.query('DESCRIBE medical_tests');
          console.log('Medical tests table structure:', columns.map(c => c.Field));
          
          // Build dynamic query based on actual columns
          const columnNames = columns.map(c => c.Field).filter(
            name => !['id', 'createdAt', 'updatedAt'].includes(name)
          );
          
          for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            const patientId = patients[Math.floor(Math.random() * patients.length)].id;
            const test_type = testTypes[Math.floor(Math.random() * testTypes.length)];
            
            const columnValues = {};
            
            // Set values based on column names
            if (columnNames.includes('patient_id')) columnValues.patient_id = patientId;
            if (columnNames.includes('test_date')) 
              columnValues.test_date = date.toISOString().split('T')[0];
            if (columnNames.includes('test_type')) 
              columnValues.test_type = test_type;
            if (columnNames.includes('status')) 
              columnValues.status = testStatuses[Math.floor(Math.random() * testStatuses.length)];
            if (columnNames.includes('results')) 
              columnValues.results = Math.random() > 0.5 ? `Results for ${test_type} ${i+1}` : null;
            
            // Create the dynamic query
            const columnsStr = Object.keys(columnValues).join(', ');
            const placeholders = Object.keys(columnValues).map(() => '?').join(', ');
            const values = Object.values(columnValues);
            
            await sequelize.query(
              `INSERT INTO medical_tests (${columnsStr}, createdAt, updatedAt) 
               VALUES (${placeholders}, NOW(), NOW())`,
              { replacements: values }
            );
          }
          
          console.log('Test medical tests created.');
        }
      } else {
        console.log('Medical tests table does not exist, skipping...');
      }
    } catch (err) {
      console.error('Error with medical tests:', err);
    }
    
    console.log('Test data creation complete.');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    process.exit();
  }
}

insertTestData(); 