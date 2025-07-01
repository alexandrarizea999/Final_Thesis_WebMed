// Importăm DataTypes din Sequelize pentru definirea tipurilor de date
const { DataTypes } = require('sequelize');
// Importăm instanța sequelize pentru conexiunea la bază de date
const { sequelize } = require('../config/database');
// Importăm modelul User pentru a stabili relațiile
const User = require('./user');

// Definim modelul Appointment (programări) cu toate câmpurile și proprietățile sale
const Appointment = sequelize.define('Appointment', {
  // ID-ul programării - cheie primară auto-incrementată
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // ID-ul pacientului - cheie străină către tabela users
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // ID-ul doctorului - cheie străină către tabela users
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Data programării (doar data, fără timp)
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // Ora programării
  appointment_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  // Motivul programării - poate fi null
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Statusul programării cu valori predefinite
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'declined'),
    defaultValue: 'scheduled'  // Valoarea implicită la creare
  }
}, {
  tableName: 'appointments',  // Numele tabelei în baza de date
  timestamps: true  // Activează câmpurile createdAt și updatedAt
});

// Definim relațiile cu modelul User
// O programare aparține unui pacient (relație many-to-one)
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });
// O programare aparține unui doctor (relație many-to-one)
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctor_id' });

// Exportăm modelul pentru a putea fi folosit în alte părți ale aplicației
module.exports = Appointment; 