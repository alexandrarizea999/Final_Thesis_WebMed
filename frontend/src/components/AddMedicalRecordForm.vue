<template>
  <div class="medical-record-form">
    <h2 class="form-title">
      <i class="fas fa-file-medical"></i> Adaugă Fișă Medicală
    </h2>
    <p class="form-subtitle">Completați informațiile pentru a adăuga o nouă fișă medicală pentru pacient.</p>
    <div class="card-container">
      <div class="form-group">
        <label for="patient-select">Selectează Pacient:</label>
        <div class="select-container">
          <select id="patient-select" v-model="patientId" required>
            <option value="">Alege un pacient</option>
            <option v-for="patient in patients" :key="patient.id" :value="patient.id">
              {{ patient.first_name }} {{ patient.last_name }} - {{ patient.email }}
            </option>
          </select>
          <i class="select-arrow fas fa-chevron-down"></i>
        </div>
      </div>
      <div class="form-group">
        <label for="diagnosis-input">Diagnostic:</label>
        <input 
          id="diagnosis-input" 
          type="text" 
          v-model="diagnosis" 
          required 
          placeholder="Introduceți diagnosticul"
          class="form-input"
        >
      </div>
      <div class="form-group">
        <label for="prescription-textarea">Prescripție:</label>
        <textarea 
          id="prescription-textarea" 
          v-model="prescription" 
          rows="4" 
          placeholder="Introduceți medicamentele și dozajul"
          class="form-textarea"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="notes-textarea">Observații:</label>
        <textarea 
          id="notes-textarea" 
          v-model="notes" 
          rows="4" 
          placeholder="Adăugați observații suplimentare"
          class="form-textarea"
        ></textarea>
      </div>
      <div class="form-actions">
        <button 
          @click="saveRecord" 
          class="save-button" 
          :disabled="!isFormValid"
        >
          <i class="fas fa-save"></i> Salvează Fișa Medicală
        </button>
        <button 
          @click="cancel" 
          class="cancel-button"
        >
          <i class="fas fa-times"></i> Anulează
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddMedicalRecordForm',
  props: {
    patients: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      patientId: '',
      diagnosis: '',
      prescription: '',
      notes: ''
    };
  },
  computed: {
    isFormValid() {
      return this.patientId && this.diagnosis;
    }
  },
  methods: {
    async saveRecord() {
      if (!this.isFormValid) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$emit('error', 'Sesiune expirată. Vă rugăm să vă autentificați din nou.');
          return;
        }
        
        const response = await axios.post(
          'http://localhost:5000/api/medical-records/create',
          {
            patient_id: this.patientId,
            diagnosis: this.diagnosis,
            prescription: this.prescription,
            notes: this.notes
          },
          { 
            headers: { 'Authorization': `Bearer ${token}` } 
          }
        );
        
        this.$emit('success', 'Fișa medicală a fost adăugată cu succes!');
        this.resetForm();
      } catch (error) {
        console.error('Error creating medical record:', error);
        this.$emit('error', 'Eroare la adăugarea fișei medicale. Vă rugăm să încercați din nou.');
      }
    },
    resetForm() {
      this.patientId = '';
      this.diagnosis = '';
      this.prescription = '';
      this.notes = '';
    },
    cancel() {
      this.resetForm();
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.medical-record-form {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

.form-title {
  color: #dc2626;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-subtitle {
  color: #64748b;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.card-container {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.select-container {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}

select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  color: #334155;
}

select {
  appearance: none;
  padding-right: 2.5rem;
}

.form-input:focus,
.form-textarea:focus,
select:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background-color: #fff;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-button,
.cancel-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.95rem;
}

.save-button {
  background: #dc2626;
  color: white;
  flex: 1;
}

.save-button:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-2px);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.cancel-button:hover {
  background: #e2e8f0;
  color: #334155;
}

@media (max-width: 768px) {
  .card-container {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-button, .cancel-button {
    width: 100%;
  }
}
</style> 