// Importăm tipurile de date din Sequelize
const { DataTypes } = require('sequelize');
// Importăm conexiunea la baza de date
const { sequelize } = require('../config/database');

// Definim modelul VisitorAppointment - gestionează programările pentru vizitatori (persoane fără cont)
const VisitorAppointment = sequelize.define('VisitorAppointment', {
  // ID-ul unic al programării
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Prenumele vizitatorului
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Numele de familie al vizitatorului
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Adresa de email pentru contact
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Numărul de telefon pentru contact
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Specialitatea medicală dorită
  specialty: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Data preferată pentru programare
  preferredDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Observații sau detalii suplimentare (opțional)
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Starea programării (în așteptare/confirmată/anulată)
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'pending'  // Inițial, orice programare este în așteptare
  },
  // Flag pentru a marca dacă programarea a fost procesată de personal
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false  // Inițial, programarea nu este procesată
  }
}, {
  tableName: 'visitor_appointments',  // Numele tabelei în baza de date
  timestamps: true  // Adaugă automat câmpurile createdAt și updatedAt
});

// Exportăm modelul pentru utilizare în aplicație
module.exports = VisitorAppointment; 