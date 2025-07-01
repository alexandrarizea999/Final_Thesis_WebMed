<template>
  <div class="access-test">
    <h2>Acces Rezultate Analize</h2>
    <div v-if="!test" class="access-form-container">
      <p class="form-description">
        Introduceți codul de acces pentru a vedea rezultatele analizelor dvs. medicale.
      </p>
      <form @submit.prevent="fetchTest" class="access-form">
        <div class="form-group">
          <label for="accessCode">Cod de acces:</label>
          <input 
            type="text" 
            id="accessCode" 
            v-model="accessCode" 
            placeholder="Introduceți codul primit de la medic"
            required
            autocomplete="off"
          >
        </div>
        <button type="submit" class="access-btn" :disabled="!accessCode">
          Accesează Rezultatele
        </button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
    <div v-else class="test-results">
      <div class="test-header">
        <h3>Rezultate Analize Medicale</h3>
        <div class="test-info">
          <p><strong>Data:</strong> {{ formatDate(test.test_date) }}</p>
          <p><strong>Tip Analiză:</strong> {{ test.test_name }}</p>
          <p><strong>Categorie:</strong> {{ test.test_category }}</p>
          <p v-if="test.notes"><strong>Observații:</strong> {{ test.notes }}</p>
        </div>
      </div>

      <div class="parameters-section">
        <h4>Parametri Analizați</h4>
        <div class="parameters-list">
          <div v-for="param in testParameters" :key="param.parameter_name" 
               :class="['parameter-item', { 'abnormal': !param.is_normal }]">
            <div class="parameter-name">{{ param.parameter_name }}</div>
            <div class="parameter-value">{{ param.value }} {{ param.unit }}</div>
            <div v-if="param.min_reference !== null && param.max_reference !== null" class="reference-range">
              Interval de referință: {{ param.min_reference }} - {{ param.max_reference }} {{ param.unit }}
            </div>
            <div class="status-indicator" :class="{ 'abnormal': !param.is_normal }">
              {{ param.is_normal ? 'Normal' : 'Anormal' }}
            </div>
          </div>
        </div>
      </div>

      <button @click="resetForm" class="back-btn">
        Înapoi
      </button>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'AccessTestView',
  data() {
    return {
      accessCode: '',
      test: null,
      error: null
    };
  },
  computed: {
    testParameters() {
      if (!this.test) return [];
      // Handle both regular and visitor test parameters
      return this.test.TestParameters || this.test.test_parameters || [];
    }
  },
  methods: {
    async fetchTest() {
      try {
        this.error = null;
        
        const response = await axios.get(
          `http://localhost:5000/api/medical-tests/access/${this.accessCode}`
        );
        
        this.test = response.data;
      } catch (error) {
        console.error('Eroare la obținerea rezultatelor:', error);
        if (error.response?.status === 404) {
          this.error = 'Cod de acces invalid. Vă rugăm să verificați și să încercați din nou.';
        } else {
          this.error = 'A apărut o eroare la obținerea rezultatelor. Vă rugăm să încercați din nou.';
        }
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ro-RO', options);
    },
    resetForm() {
      this.accessCode = '';
      this.test = null;
      this.error = null;
    }
  }
};
</script>

<style scoped>
.access-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

h2 {
  color: #660000;
  margin-bottom: 30px;
  text-align: center;
}

.access-form-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-description {
  text-align: center;
  color: #666;
  margin-bottom: 25px;
}

.access-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #990000;
}

input {
  padding: 15px;
  border: 2px solid #ffeeee;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #cc0000;
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.access-btn {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  margin-top: 10px;
  align-self: center;
}

.access-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.3);
  background: linear-gradient(135deg, #ff0000, #cc0000);
}

.access-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 20px;
  color: #cc0000;
  background: #fff0f0;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #cc0000;
  font-weight: 500;
}

.test-results {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.1);
}

.test-header {
  margin-bottom: 25px;
}

.test-header h3 {
  margin: 0 0 15px;
  color: #660000;
  font-size: 1.8rem;
}

.test-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-item .label {
  font-weight: 600;
  color: #990000;
}

.meta-item .value {
  color: #333;
}

.parameters-section {
  margin: 25px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.parameters-list {
  padding: 15px;
}

.parameter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.parameter-item:last-child {
  border-bottom: none;
}

.parameter-name {
  font-weight: 600;
  color: #333;
}

.parameter-value {
  color: #666;
}

.reference-range {
  color: #666;
  font-size: 0.9em;
}

.status-indicator {
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
  color: #666;
}

.status-indicator.abnormal {
  background-color: #fff0f0;
  color: #dc3545;
}

.visitor-info {
  display: none;
}

.visitor-info h4,
.visitor-info p,
.visitor-info strong {
  display: none;
}

.back-btn {
  background: #666;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: all 0.3s ease;
  margin-top: 20px;
  align-self: center;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  background: #555;
}

.back-btn:active {
  transform: translateY(1px);
}

@media (max-width: 768px) {
  .test-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .access-form-container,
  .test-results {
    padding: 20px;
  }
}
</style> 