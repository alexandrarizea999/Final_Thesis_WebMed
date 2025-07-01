const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

// Definirea modelului pentru teste medicale
// Acest model stochează informații despre testele medicale efectuate de pacienți
// și prescrise de doctori
const MedicalTest = sequelize.define('MedicalTest', {
  // ID-ul unic al testului medical
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // ID-ul pacientului pentru care se efectuează testul
  // Referință la tabela users pentru datele pacientului
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // ID-ul doctorului care a prescris testul
  // Referință la tabela users pentru datele doctorului
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },

  // Data la care trebuie efectuat testul
  // Format: YYYY-MM-DD
  test_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Numele testului medical
  // Exemplu: "Hemogramă completă", "Glicemie", etc.
  test_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Categoria testului medical
  // Ajută la organizarea și filtrarea testelor
  // Exemplu: "Analize sange", "Imagistică", etc.
  test_category: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Note adiționale despre test
  // Pot include instrucțiuni speciale sau observații
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Cod unic de acces pentru test
  // Folosit pentru accesarea rezultatelor în mod securizat
  // Lungime fixă de 10 caractere, trebuie să fie unic
  access_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  }
}, {
  // Numele tabelei în baza de date
  tableName: 'medical_tests',
  
  // Activează câmpurile createdAt și updatedAt
  // pentru urmărirea momentului creării și ultimei modificări
  timestamps: true
});

// Definirea relațiilor cu modelul User
// Un test medical aparține unui pacient și este prescris de un doctor
MedicalTest.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });
MedicalTest.belongsTo(User, { as: 'doctor', foreignKey: 'doctor_id' });

module.exports = MedicalTest; 