const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const MedicalTest = require('./medical_test');
const TestParameter = sequelize.define('TestParameter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  test_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medical_tests',
      key: 'id'
    }
  },
  parameter_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  min_reference: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  max_reference: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  is_normal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'test_parameters',
  timestamps: true
});
TestParameter.belongsTo(MedicalTest, { foreignKey: 'test_id' });
MedicalTest.hasMany(TestParameter, { foreignKey: 'test_id' });
module.exports = TestParameter; 