const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const LoyaltyPackage = sequelize.define('LoyaltyPackage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  points_required: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'loyalty_packages',
  timestamps: true
});
module.exports = LoyaltyPackage; 