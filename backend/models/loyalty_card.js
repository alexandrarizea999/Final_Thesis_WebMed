const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const LoyaltyCard = sequelize.define('LoyaltyCard', {
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
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_earned_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'loyalty_cards',
  timestamps: true
});
LoyaltyCard.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });
User.hasOne(LoyaltyCard, { foreignKey: 'patient_id' });
module.exports = LoyaltyCard; 