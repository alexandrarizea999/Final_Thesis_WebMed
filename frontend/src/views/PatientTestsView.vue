<template>
  <div class="patient-tests">
    <div class="navbar">
      <h2>Profil Pacient</h2>
      <nav>
        <button 
          @click="setActiveTab('medical-tests')" 
          :class="['nav-btn', activeTab === 'medical-tests' ? 'active' : '']">
          Analize Medicale
        </button>
        <button 
          @click="setActiveTab('personal-info')" 
          :class="['nav-btn', activeTab === 'personal-info' ? 'active' : '']">
          Informații Personale
        </button>
        <button 
          @click="setActiveTab('medical-records')" 
          :class="['nav-btn', activeTab === 'medical-records' ? 'active' : '']">
          Fișe Medicale
        </button>
        <button 
          @click="setActiveTab('appointments')" 
          :class="['nav-btn', activeTab === 'appointments' ? 'active' : '']">
          Programări
        </button>
      </nav>
    </div>
    <div v-if="activeTab === 'medical-tests'" v-motion-slide-visible>
      <div v-if="loading" class="loading">
        <p>Se încarcă analizele...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="tests.length === 0" class="no-tests">
        <p>Nu aveți încă analize medicale înregistrate.</p>
      </div>
      
      <div v-else class="tests-container">
        <div class="filters-section">
          <h3>Analizele Mele Medicale</h3>
          <div class="filters">
            <button class="filter-btn active">Toate</button>
            <button class="filter-btn">Recente</button>
            <button class="filter-btn">Cu valori anormale</button>
          </div>
        </div>
        <div class="tests-list">
          <div 
            v-for="test in tests" 
            :key="test.id" 
            :class="['test-item', selectedTest && selectedTest.id === test.id ? 'selected' : '']"
            @click="selectTest(test)"
          >
            <div class="test-header">
              <div class="test-name">{{ test.test_name }}</div>
              <div class="test-date">{{ formatDate(test.test_date) }}</div>
            </div>
            <div class="test-category">{{ test.test_category }}</div>
            <div class="test-status">
              <span 
                :class="['status-indicator', getTestStatus(test.TestParameters)]"
                :title="getTestStatusText(test.TestParameters)"
              ></span>
              {{ getAbnormalCount(test.TestParameters) }}
            </div>
          </div>
        </div>
        <div v-if="selectedTest" class="test-details">
          <div class="test-details-header">
            <h3>{{ selectedTest.test_name }}</h3>
            <div class="test-meta">
              <div class="meta-item">
                <strong>Data:</strong> {{ formatDate(selectedTest.test_date) }}
              </div>
              <div class="meta-item">
                <strong>Categorie:</strong> {{ selectedTest.test_category }}
              </div>
            </div>
          </div>
          
          <div v-if="selectedTest.notes" class="test-notes">
            <strong>Observații:</strong> {{ selectedTest.notes }}
          </div>
          
          <div class="parameters-table">
            <table>
              <thead>
                <tr>
                  <th>Parametru</th>
                  <th>Valoare</th>
                  <th>Unitate</th>
                  <th>Valori de referință</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="param in selectedTest.TestParameters" 
                  :key="param.id"
                  :class="{ 'abnormal': !param.is_normal }"
                >
                  <td>{{ param.parameter_name }}</td>
                  <td class="value">{{ param.value }}</td>
                  <td>{{ param.unit }}</td>
                  <td class="reference">
                    <template v-if="param.min_reference !== null && param.max_reference !== null">
                      {{ param.min_reference }} - {{ param.max_reference }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="legend">
            <div class="legend-item">
              <span class="legend-indicator normal"></span> Valoare normală
            </div>
            <div class="legend-item">
              <span class="legend-indicator abnormal"></span> Valoare anormală
            </div>
          </div>
        </div>
        
        <div v-else class="no-selection">
          <p>Selectați o analiză din lista de mai sus pentru a vedea detaliile.</p>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'personal-info'" class="dashboard-section" v-motion-slide-visible>
      <h3>Informații Personale</h3>
      <div class="info-grid">
        <div class="info-item hover-effect">
          <label>Nume:</label>
          <span>{{ userData ? userData.first_name + ' ' + userData.last_name : 'Indisponibil' }}</span>
        </div>
        <div class="info-item hover-effect">
          <label>Email:</label>
          <span>{{ userData ? userData.email : 'Indisponibil' }}</span>
        </div>
        <div class="info-item hover-effect">
          <label>Telefon:</label>
          <span>{{ userData && userData.phone_number ? userData.phone_number : 'Nespecificat' }}</span>
        </div>
        <div class="info-item hover-effect">
          <label>Adresă:</label>
          <span>{{ userData && userData.address ? userData.address : 'Nespecificat' }}</span>
        </div>
        <div class="info-item hover-effect">
          <label>Oraș:</label>
          <span>{{ userData && userData.city ? userData.city : 'Nespecificat' }}</span>
        </div>
        <div class="info-item hover-effect">
          <label>Județ:</label>
          <span>{{ userData && userData.county ? userData.county : 'Nespecificat' }}</span>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'medical-records'" class="dashboard-section" v-motion-slide-visible>
      <h3>Fișe Medicale</h3>
      <p class="placeholder-text">Fișele dumneavoastră medicale vor apărea aici.</p>
    </div>
    <div v-if="activeTab === 'appointments'" class="dashboard-section" v-motion-slide-visible>
      <h3>Programări</h3>
      <p class="placeholder-text">Programările dumneavoastră vor apărea aici.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PatientTestsView',
  data() {
    return {
      tests: [],
      selectedTest: null,
      loading: true,
      error: null,
      isMobileView: false,
      activeTab: 'medical-tests',
      userData: null
    };
  },
  async created() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.userData = JSON.parse(storedUser);
        console.log('Date utilizator încărcate:', this.userData);
      } catch (error) {
        console.error('Eroare la parsarea datelor utilizatorului din localStorage:', error);
        this.error = 'Eroare la încărcarea datelor utilizatorului. Vă rugăm să vă autentificați din nou.';
      }
    } else {
      console.warn('Nu s-au găsit date utilizator în localStorage');
      this.error = 'Sesiunea utilizatorului nu a fost găsită. Vă rugăm să vă autentificați.';
    }
    
    await this.fetchTests();
    this.checkViewportSize();
    window.addEventListener('resize', this.checkViewportSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkViewportSize);
  },
  methods: {
    checkViewportSize() {
      this.isMobileView = window.innerWidth < 768;
    },
    
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    
    async fetchTests() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.error = 'Vă rugăm să vă autentificați pentru a vedea rezultatele analizelor.';
          return;
        }

        this.loading = true;
        const response = await axios.get('http://localhost:5000/api/medical-tests/my-tests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        this.tests = response.data;
        this.loading = false;
      } catch (error) {
        console.error('Eroare la încărcarea analizelor:', error);
        this.error = 'Nu s-au putut încărca analizele. Vă rugăm să încercați din nou.';
        this.loading = false;
      }
    },
    
    selectTest(test) {
      this.selectedTest = test;
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    getTestStatus(parameters) {
      if (!parameters || parameters.length === 0) return 'normal';
      
      const hasAbnormal = parameters.some(param => !param.is_normal);
      return hasAbnormal ? 'abnormal' : 'normal';
    },
    
    getTestStatusText(parameters) {
      if (!parameters || parameters.length === 0) return 'Nu există parametri';
      
      const abnormalCount = parameters.filter(param => !param.is_normal).length;
      if (abnormalCount === 0) return 'Toate valorile sunt normale';
      
      return `${abnormalCount} parametri anormali`;
    },
    
    getAbnormalCount(parameters) {
      if (!parameters || parameters.length === 0) return '';
      
      const abnormalCount = parameters.filter(param => !param.is_normal).length;
      if (abnormalCount === 0) return 'Toate valorile normale';
      
      return `${abnormalCount} ${abnormalCount === 1 ? 'valoare anormală' : 'valori anormale'}`;
    }
  }
};
</script>

<style scoped>
.patient-tests {
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.navbar {
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.navbar h2 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  background: linear-gradient(45deg, #cc0000, #ff0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

nav {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  width: 100%;
  justify-content: center;
  padding-bottom: 5px;
}

.nav-btn {
  background: none;
  border: 2px solid #cc0000;
  color: #cc0000;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin: 0 5px;
}

.nav-btn:hover {
  background: #fff3f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(204, 0, 0, 0.1);
}

.nav-btn.active {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.2);
}

.nav-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.3);
}

.loading, .error-message, .no-tests {
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 20px;
}

.error-message {
  color: #cc0000;
  background: #fff0f0;
  border-left: 5px solid #cc0000;
}

.tests-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
}

.filters-section {
  margin-bottom: 15px;
}

.filters-section h3 {
  color: #cc0000;
  margin: 0 0 15px;
  font-size: 1.2rem;
  border-bottom: 2px solid #ffeeee;
  padding-bottom: 10px;
}

.filters {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-btn {
  background: none;
  border: 1px solid #eee;
  padding: 5px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.filter-btn.active {
  background-color: #fff0f0;
  border-color: #cc0000;
  color: #cc0000;
}

.tests-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 300px;
  margin-bottom: 20px;
}

.test-item {
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-item:hover {
  box-shadow: 0 4px 8px rgba(204, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease;
  border-color: #ffcccc;
}

.test-item.selected {
  background-color: #fff0f0;
  border: 1px solid #cc0000;
}

.test-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.test-name {
  font-weight: bold;
  color: #333;
  font-size: 1rem;
}

.test-date {
  font-size: 0.85rem;
  color: #666;
}

.test-category {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.test-status {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.normal {
  background-color: #28a745;
}

.status-indicator.abnormal {
  background-color: #dc3545;
}

.test-details, .no-selection {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow-y: auto;
}

.test-details-header {
  margin-bottom: 20px;
}

.test-details h3 {
  margin: 0 0 15px;
  color: #cc0000;
  font-size: 1.4rem;
}

.test-meta {
  display: flex;
  gap: 20px;
  color: #666;
  flex-wrap: wrap;
}

.meta-item {
  margin-bottom: 5px;
}

.test-notes {
  margin: 20px 0;
  padding: 15px;
  background: #fff;
  border-radius: 5px;
  border-left: 3px solid #f0ad4e;
}

.parameters-table {
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  overflow-x: auto;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f3f3f3;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

tr:last-child td {
  border-bottom: none;
}

tr.abnormal {
  background-color: #fff0f0;
}

tr.abnormal td.value {
  color: #dc3545;
  font-weight: 600;
}

.reference {
  color: #666;
  font-size: 0.9em;
}

.legend {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  font-size: 0.9em;
  color: #666;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.legend-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-indicator.normal {
  background-color: #28a745;
}

.legend-indicator.abnormal {
  background-color: #dc3545;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* Dashboard Section Styles */
.dashboard-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin: 20px;
}

.dashboard-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #cc0000;
  font-size: 1.2rem;
  border-bottom: 2px solid #ffeeee;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: #990000;
  margin-bottom: 5px;
}

.placeholder-text {
  color: #666;
  text-align: center;
  padding: 40px 0;
  font-style: italic;
}

.hover-effect:hover {
  box-shadow: 0 4px 8px rgba(204, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .navbar {
    padding: 10px;
  }
  
  nav {
    justify-content: flex-start;
  }
  
  .nav-btn {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
  
  .test-details, .no-selection {
    padding: 15px;
  }
  
  .tests-list {
    max-height: 250px;
  }
  
  th, td {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
  
  .dashboard-content {
    padding: 15px;
  }
  
  .dashboard-section {
    padding: 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .navbar h2 {
    font-size: 1.3rem;
  }
  
  .nav-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .test-item {
    padding: 10px;
  }
  
  .test-name {
    font-size: 0.9rem;
  }
  
  .test-date, .test-category {
    font-size: 0.8rem;
  }
  
  .test-details h3 {
    font-size: 1.2rem;
  }
  
  .dashboard-section {
    padding: 15px;
    margin: 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 