// Importăm tipurile de date din Sequelize
const { DataTypes } = require('sequelize');
// Importăm conexiunea la baza de date
const { sequelize } = require('../config/database');
// Importăm modelele necesare pentru relații
const User = require('./user');
const LoyaltyPackage = require('./loyalty_package');

// Definim modelul LoyaltyRedemption - gestionează răscumpărarea beneficiilor din programul de loialitate
const LoyaltyRedemption = sequelize.define('LoyaltyRedemption', {
  // ID-ul unic al răscumpărării
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // ID-ul pacientului care răscumpără beneficiile
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // ID-ul pachetului de beneficii ales pentru răscumpărare
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'loyalty_packages',
      key: 'id'
    }
  },
  // Numărul de puncte folosite pentru această răscumpărare
  points_spent: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Starea răscumpărării (în așteptare/finalizată/anulată)
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'  // Inițial, orice răscumpărare este în așteptare
  },
  // Data la care s-a făcut cererea de răscumpărare
  redemption_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW  // Data curentă la momentul creării
  }
}, {
  tableName: 'loyalty_redemptions',  // Numele tabelei în baza de date
  timestamps: true  // Adaugă automat câmpurile createdAt și updatedAt
});

// Definim relațiile modelului
// O răscumpărare aparține unui pacient
LoyaltyRedemption.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });
// O răscumpărare este asociată cu un pachet de beneficii
LoyaltyRedemption.belongsTo(LoyaltyPackage, { as: 'package', foreignKey: 'package_id' });

// Exportăm modelul pentru utilizare în aplicație
module.exports = LoyaltyRedemption; 