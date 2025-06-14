const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const UserProfile = require('./user_profile');
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('patient', 'doctor', 'admin', 'dispecer'),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true
});
User.hasOne(UserProfile, {
  foreignKey: 'user_id',
  as: 'user_profile',
  onDelete: 'CASCADE'
});
UserProfile.belongsTo(User, {
  foreignKey: 'user_id'
});
module.exports = User; 