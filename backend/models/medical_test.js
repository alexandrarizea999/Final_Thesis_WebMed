const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const MedicalTest = sequelize.define('MedicalTest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  test_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  test_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  test_category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  access_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'medical_tests',
  timestamps: true
});
MedicalTest.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });
MedicalTest.belongsTo(User, { as: 'doctor', foreignKey: 'doctor_id' });
module.exports = MedicalTest; 