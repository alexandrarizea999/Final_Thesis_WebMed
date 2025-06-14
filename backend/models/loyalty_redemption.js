const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const LoyaltyPackage = require('./loyalty_package');
const LoyaltyRedemption = sequelize.define('LoyaltyRedemption', {
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
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'loyalty_packages',
      key: 'id'
    }
  },
  points_spent: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  redemption_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'loyalty_redemptions',
  timestamps: true
});
LoyaltyRedemption.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });
LoyaltyRedemption.belongsTo(LoyaltyPackage, { as: 'package', foreignKey: 'package_id' });
module.exports = LoyaltyRedemption; 