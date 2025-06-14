<template>
  <div class="doctor-dashboard" v-if="user">
    <div class="dashboard-header">
      <div class="brand">
        <i class="fas fa-hospital"></i>
      </div>
      <div style="display: inline-block; padding: 8px 16px; border-radius: 30px; font-size: 0.9rem; font-weight: 500; 
                  text-transform: capitalize; background: linear-gradient(135deg, #dc2626, #b91c1c) !important; 
                  color: white !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        {{ user.role === 'doctor' ? 'Medic' : 'Pacient' }}
      </div>
    </div>
    <div class="dashboard-nav">
      <button @click="activeTab = 'profile'" :class="['nav-tab', { active: activeTab === 'profile' }]">
        <i class="fas fa-user"></i>
        <span>Profil</span>
      </button>
      <button @click="activeTab = 'location'" :class="['nav-tab', { active: activeTab === 'location' }]">
        <i class="fas fa-map-marker-alt"></i>
        <span>Locație</span>
      </button>
      <button @click="activeTab = 'security'" :class="['nav-tab', { active: activeTab === 'security' }]">
        <i class="fas fa-lock"></i>
        <span>Securitate</span>
      </button>
      <button @click="activeTab = 'add-record'" :class="['nav-tab', { active: activeTab === 'add-record' }]">
        <i class="fas fa-file-medical"></i>
        <span>Adaugă Fișă</span>
      </button>
      <button @click="activeTab = 'add-test'" :class="['nav-tab', { active: activeTab === 'add-test' }]">
        <i class="fas fa-vial"></i>
        <span>Adaugă Analiză</span>
      </button>
      <button @click="activeTab = 'records'" :class="['nav-tab', { active: activeTab === 'records' }]">
        <i class="fas fa-folder-open"></i>
        <span>Fișe Recente</span>
      </button>
      <button @click="activeTab = 'availability'" :class="['nav-tab', { active: activeTab === 'availability' }]">
        <i class="fas fa-calendar-alt"></i>
        <span>Disponibilitate</span>
      </button>
      <button @click="activeTab = 'appointments'" :class="['nav-tab', { active: activeTab === 'appointments' }]">
        <i class="fas fa-calendar-check"></i>
        <span>Programări</span>
      </button>
    </div>
    <div class="dashboard-content">
      <div class="dashboard-section" v-show="activeTab === 'profile'">
        <h3>Informații Personale</h3>
        
        <div v-if="editingPersonal" class="edit-form">
          <div class="form-group">
            <label>Nume:</label>
            <input type="text" v-model="personalForm.first_name" required>
          </div>
          <div class="form-group">
            <label>Prenume:</label>
            <input type="text" v-model="personalForm.last_name" required>
          </div>
          <div class="form-group">
            <label>Telefon:</label>
            <input type="tel" v-model="personalForm.phone_number">
          </div>
          <div class="form-group">
            <label>Sex:</label>
            <select v-model="personalForm.gender">
              <option value="M">Masculin</option>
              <option value="F">Feminin</option>
              <option value="Other">Altul</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data Nașterii:</label>
            <input type="date" v-model="personalForm.date_of_birth">
          </div>
          <div class="form-actions">
            <button @click="savePersonalInfo" class="submit-btn" :disabled="!isPersonalFormValid">
              Salvează
            </button>
            <button @click="cancelEditPersonal" class="cancel-btn">
              Anulează
            </button>
          </div>
        </div>
        <div v-else class="info-grid">
          <div class="info-item hover-effect">
            <label>Nume:</label>
            <span>{{ user.first_name }} {{ user.last_name }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Email:</label>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Telefon:</label>
            <span>{{ user.phone_number || 'Nespecificat' }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Sex:</label>
            <span>{{ formatGender(user.gender) }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Data Nașterii:</label>
            <span>{{ user.date_of_birth ? formatDate(user.date_of_birth) : 'Nespecificat' }}</span>
          </div>
          
          <button @click="editPersonal" class="edit-btn">
            <i class="fas fa-edit"></i> Editează
          </button>
        </div>
      </div>
      <div class="dashboard-section" v-show="activeTab === 'location'">
        <h3>Locație</h3>
        
        <div v-if="editingLocation" class="edit-form">
          <div class="form-group">
            <label>Adresă:</label>
            <input type="text" v-model="locationForm.address">
          </div>
          <div class="form-group">
            <label>Oraș:</label>
            <input type="text" v-model="locationForm.city">
          </div>
          <div class="form-group">
            <label>Județ:</label>
            <input type="text" v-model="locationForm.county">
          </div>
          
          <div class="form-actions">
            <button @click="saveLocationInfo" class="submit-btn">
              Salvează
            </button>
            <button @click="cancelEditLocation" class="cancel-btn">
              Anulează
            </button>
          </div>
        </div>
        <div v-else class="info-grid">
          <div class="info-item hover-effect">
            <label>Adresă:</label>
            <span>{{ user.address || 'Nespecificat' }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Oraș:</label>
            <span>{{ user.city || 'Nespecificat' }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Județ:</label>
            <span>{{ user.county || 'Nespecificat' }}</span>
          </div>
          
          <button @click="editLocation" class="edit-btn">
            <i class="fas fa-edit"></i> Editează
          </button>
        </div>
      </div>
      <div class="dashboard-section security-section" v-show="activeTab === 'security'">
        <h3>Securitate</h3>
        <p class="section-description">Schimbați parola contului dumneavoastră. Pentru securitate, introduceti parola actuală.</p>
        
        <div class="security-form">
          <div class="form-group">
            <label>Parolă Actuală:</label>
            <input type="password" v-model="securityForm.currentPassword" placeholder="Introduceți parola actuală">
          </div>
          <div class="form-group">
            <label>Parolă Nouă:</label>
            <input type="password" v-model="securityForm.newPassword" placeholder="Introduceți parola nouă">
          </div>
          <div class="form-group">
            <label>Confirmați Parola Nouă:</label>
            <input type="password" v-model="securityForm.confirmPassword" placeholder="Confirmați parola nouă">
          </div>
          
          <div class="security-button-container">
            <button @click="updatePassword" class="security-button" :disabled="!isPasswordFormValid">
              Actualizați Parola
            </button>
          </div>
        </div>
      </div>
      <div class="dashboard-section" v-show="activeTab === 'add-record'">
        <h3><i class="fas fa-file-medical"></i> Adaugă Fișă Medicală</h3>
        <p class="section-description">Completați informațiile pentru a adăuga o nouă fișă medicală pentru pacient.</p>
        
        <div class="add-record-form">
          <div class="form-group">
            <label for="patient-select">Selectează Pacient:</label>
            <div class="select-wrapper">
              <select id="patient-select" v-model="newRecord.patient_id" required>
                <option value="">Alege un pacient</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.first_name }} {{ patient.last_name }} - {{ patient.email }}
                </option>
              </select>
              <i class="fas fa-chevron-down select-icon"></i>
            </div>
          </div>
          <div class="form-group">
            <label for="diagnosis-input">Diagnostic:</label>
            <input id="diagnosis-input" type="text" v-model="newRecord.diagnosis" required placeholder="Introduceti diagnosticul">
          </div>
          <div class="form-group">
            <label for="prescription-textarea">Prescripție:</label>
            <textarea id="prescription-textarea" v-model="newRecord.prescription" rows="3" placeholder="Introduceți medicamentele și dozajul"></textarea>
          </div>
          <div class="form-group">
            <label for="notes-textarea">Observații:</label>
            <textarea id="notes-textarea" v-model="newRecord.notes" rows="3" placeholder="Adăugați observații suplimentare"></textarea>
          </div>
          <div class="form-actions">
            <button @click="submitRecord" class="submit-btn primary-btn" :disabled="!newRecord.patient_id || !newRecord.diagnosis">
              <i class="fas fa-save"></i> Salvează Fișa Medicală
            </button>
            <button @click="resetRecordForm" class="cancel-btn">
              <i class="fas fa-times"></i> Anulează
            </button>
          </div>
        </div>
      </div>
      <div class="dashboard-section" v-show="activeTab === 'add-test'">
        <h3><i class="fas fa-vial"></i> Adaugă Analiză Medicală</h3>
        <p class="section-description">Completați informațiile pentru a adăuga o nouă analiză medicală pentru pacient.</p>
        <div class="add-record-form">
          <div class="form-group">
            <label for="test-patient-select">Pacient:</label>
            <div class="select-wrapper">
              <select id="test-patient-select" v-model="newTest.patientId" required>
                <option value="">Selectează pacientul</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.first_name }} {{ patient.last_name }}
                </option>
              </select>
              <i class="fas fa-chevron-down select-icon"></i>
            </div>
          </div>
          <div class="form-group">
            <label for="test-date-input">Data Analizei:</label>
            <input id="test-date-input" type="date" v-model="newTest.testDate" required>
          </div>
          <div class="form-group">
            <label for="test-name-input">Nume Analiză:</label>
            <input id="test-name-input" type="text" v-model="newTest.testName" required placeholder="Introduceți numele analizei">
          </div>
          <div class="form-group">
            <label for="test-category-input">Categorie:</label>
            <input id="test-category-input" type="text" v-model="newTest.testCategory" required placeholder="Introduceți categoria analizei">
          </div>
          <div class="form-group">
            <label for="test-notes-textarea">Observații:</label>
            <textarea id="test-notes-textarea" v-model="newTest.notes" rows="3" placeholder="Adăugați observații suplimentare"></textarea>
          </div>
          <div class="test-parameters">
            <h4>Parametri Analiză <button @click="addParameter" class="add-parameter-btn"><i class="fas fa-plus"></i> Adaugă Parametru</button></h4>
            <div v-for="(param, index) in newTest.parameters" :key="index" class="parameter-item">
              <div class="parameter-header">
                <span>Parametru #{{ index + 1 }}</span>
                <button @click="removeParameter(index)" class="remove-parameter-btn"><i class="fas fa-times"></i></button>
              </div>
              
              <div class="parameter-grid">
                <div class="form-group">
                  <label :for="'param-name-' + index">Nume:</label>
                  <input :id="'param-name-' + index" type="text" v-model="param.name" required placeholder="Nume parametru">
                </div>
                
                <div class="form-group">
                  <label :for="'param-value-' + index">Valoare:</label>
                  <input :id="'param-value-' + index" type="number" step="0.01" v-model="param.value" required placeholder="Valoare">
                </div>
                
                <div class="form-group">
                  <label :for="'param-unit-' + index">Unitate:</label>
                  <input :id="'param-unit-' + index" type="text" v-model="param.unit" required placeholder="Unitate de măsură">
                </div>
                
                <div class="form-group">
                  <label :for="'param-min-' + index">Minim:</label>
                  <input :id="'param-min-' + index" type="number" step="0.01" v-model="param.minReference" placeholder="Valoare minimă">
                </div>
                
                <div class="form-group">
                  <label :for="'param-max-' + index">Maxim:</label>
                  <input :id="'param-max-' + index" type="number" step="0.01" v-model="param.maxReference" placeholder="Valoare maximă">
                </div>
              </div>
            </div>
            
            <div v-if="newTest.parameters.length === 0" class="no-parameters">
              <p><i class="fas fa-info-circle"></i> Nu există parametri adăugați. Adaugă cel puțin un parametru.</p>
            </div>
          </div>

          <div class="form-actions">
            <button @click="submitTest" class="submit-btn primary-btn" 
                  :disabled="!newTest.patientId || !newTest.testDate || !newTest.testName || 
                           !newTest.testCategory || newTest.parameters.length === 0">
              <i class="fas fa-save"></i> Salvează Analiza
            </button>
            <button @click="resetTestForm" class="cancel-btn">
              <i class="fas fa-times"></i> Anulează
            </button>
          </div>
        </div>
      </div>
      <div class="dashboard-section" v-show="activeTab === 'records'">
        <h3>Fișe Medicale Recente</h3>
        <div class="records-list" v-if="recentRecords.length > 0">
          <div v-for="record in recentRecords" :key="record.id" class="record-item">
            <div class="record-header">
              <span class="record-date">{{ formatDate(record.date) }}</span>
              <span class="patient-name">{{ record.patient_name }}</span>
            </div>
            <div class="record-content">
              <div class="record-field">
                <label>Diagnostic:</label>
                <span>{{ record.diagnosis }}</span>
              </div>
              <div class="record-field" v-if="record.prescription">
                <label>Prescripție:</label>
                <span>{{ record.prescription }}</span>
              </div>
              <div class="record-field" v-if="record.notes">
                <label>Observații:</label>
                <span>{{ record.notes }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-records">
          <p>Nu există fișe medicale recente</p>
        </div>
      </div>
      <div class="dashboard-section" v-show="activeTab === 'availability'">
        <h3>Programul de Lucru</h3>
        
        <div v-if="activeTab === 'availability'" class="availability-container">
          <doctor-schedule 
            :existing-schedule="availabilityArray"
            @save="handleSaveSchedule"
          />
        </div>
      </div>
      <div class="dashboard-section" v-show="activeTab === 'appointments'">
        <h3>Programări Viitoare</h3>
        <div class="appointments-list" v-if="upcomingAppointments.length > 0">
          <appointment-card
            v-for="appointment in upcomingAppointments"
            :key="appointment.id"
            :appointment="appointment"
            :patient-name="getPatientName(appointment.patient_id)"
            :is-doctor="true"
            :show-doctor-info="false"
            @complete="completeAppointment"
            @cancel="cancelAppointment"
            @decline="declineAppointment"
          />
        </div>
        <div v-else class="no-appointments">
          <p>Nu există programări viitoare</p>
        </div>
      </div>
    </div>

    <button @click="logout" class="logout-btn">
      <i class="fas fa-sign-out-alt"></i>
      <span>Deconectare</span>
    </button>
    <div class="toast-container" v-if="toast.show">
      <div class="toast" :class="toast.type">
        <div class="toast-icon">
          <i class="fas" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click="toast.show = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import axiosInstance from '../services/axios-config'
import DoctorSchedule from '../components/DoctorSchedule.vue'
import AppointmentCard from '../components/AppointmentCard.vue'

export default {
  name: 'DoctorDashboard',
  components: {
    DoctorSchedule,
    AppointmentCard
  },
  data() {
    return {
      user: null,
      patients: [],
      recentRecords: [],
      newRecord: {
        patient_id: '',
        diagnosis: '',
        prescription: '',
        notes: ''
      },
      availability: {
        Monday: { is_available: false, start_time: '09:00', end_time: '17:00' },
        Tuesday: { is_available: false, start_time: '09:00', end_time: '17:00' },
        Wednesday: { is_available: false, start_time: '09:00', end_time: '17:00' },
        Thursday: { is_available: false, start_time: '09:00', end_time: '17:00' },
        Friday: { is_available: false, start_time: '09:00', end_time: '17:00' },
        Saturday: { is_available: false, start_time: '09:00', end_time: '17:00' },
        Sunday: { is_available: false, start_time: '09:00', end_time: '17:00' }
      },
      originalAvailability: null,
      upcomingAppointments: [],
      newTest: {
        patientId: '',
        testDate: new Date().toISOString().slice(0, 10),
        testName: '',
        testCategory: '',
        notes: '',
        parameters: []
      },
      activeTab: 'profile',
      isLoading: false,
      toast: {
        show: false,
        message: '',
        type: 'success',
        timeout: null
      },
      editingPersonal: false,
      personalForm: {
        first_name: '',
        last_name: '',
        phone_number: '',
        gender: '',
        date_of_birth: ''
      },
      editingLocation: false,
      locationForm: {
        address: '',
        city: '',
        county: ''
      },
      securityForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    canSubmitTest() {
      return this.isTestFormValid();
    },
    hasAvailabilityChanges() {
      if (!this.originalAvailability) return false;
      
      for (const day in this.availability) {
        const original = this.originalAvailability[day] || {};
        const current = this.availability[day];
        
        if (original.is_available !== current.is_available) return true;
        if (original.is_available && current.is_available) {
          if (original.start_time !== current.start_time) return true;
          if (original.end_time !== current.end_time) return true;
        }
      }
      
      return false;
    },
    availabilityArray() {
      if (!this.availability) return [];
      
      const result = [];
      for (const day in this.availability) {
        if (this.availability[day]) {
          result.push({
            day_of_week: day,
            is_available: this.availability[day].is_available,
            start_time: this.availability[day].start_time,
            end_time: this.availability[day].end_time
          });
        }
      }
      
      return result;
    },
    isPersonalFormValid() {
      return this.personalForm.first_name && this.personalForm.last_name;
    },
    isPasswordFormValid() {
      return this.securityForm.currentPassword !== '' && 
        this.securityForm.newPassword !== '' && 
        this.securityForm.confirmPassword !== '' &&
        this.securityForm.newPassword === this.securityForm.confirmPassword;
    }
  },
  methods: {
    translateDay(day) {
      const translations = {
        'Monday': 'Luni',
        'Tuesday': 'Marți',
        'Wednesday': 'Miercuri',
        'Thursday': 'Joi',
        'Friday': 'Vineri',
        'Saturday': 'Sâmbătă',
        'Sunday': 'Duminică'
      };
      return translations[day] || day;
    },
    translateStatus(status) {
      const translations = {
        'scheduled': 'Programat',
        'completed': 'Finalizat',
        'cancelled': 'Anulat',
        'declined': 'Refuzat'
      };
      return translations[status] || status;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatTime(time) {
      if (!time) return '';  
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    },
    getPatientName(patientId) {
      const patient = this.patients.find(p => p.id === patientId);
      return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
    },
    async fetchPatients() {
      try {
        const token = localStorage.getItem('token');
        const patientsResponse = await axios.get('http://localhost:5000/api/users/patients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const visitorsResponse = await axios.get('http://localhost:5000/api/visitor-appointment/for-doctor', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.patients = [
          ...patientsResponse.data,
          ...visitorsResponse.data
        ];
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    },
    async submitRecord() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/medical-records/create', 
          this.newRecord,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.newRecord = {
          patient_id: '',
          diagnosis: '',
          prescription: '',
          notes: ''
        };
        alert('Medical record added successfully!');
        this.fetchRecentRecords();
      } catch (error) {
        console.error('Error creating record:', error);
        alert('Error creating medical record. Please try again.');
      }
    },
    async fetchRecentRecords() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/medical-records/recent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.recentRecords = response.data;
      } catch (error) {
        console.error('Error fetching recent records:', error);
      }
    },
    async deleteRecord(recordId) {
      if (!confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/medical-records/delete/${recordId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Medical record deleted successfully!');
        this.fetchRecentRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting medical record. Please try again.');
      }
    },
    async fetchAvailability() {
      try {
        const token = localStorage.getItem('token');
        const userId = this.user?.userId || this.user?.id;
        
        if (!userId) {
          console.error('User ID not found');
          this.showError('Utilizator neidentificat. Vă rugăm să vă reautentificați.');
          return;
        }
        console.log('Fetching availability for doctor ID:', userId);
        const response = await axios.get(`http://localhost:5000/api/availability/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`Received ${response.data.length} availability records:`, response.data);
        const defaultAvailability = {
          Monday: { is_available: false, start_time: '09:00', end_time: '17:00' },
          Tuesday: { is_available: false, start_time: '09:00', end_time: '17:00' },
          Wednesday: { is_available: false, start_time: '09:00', end_time: '17:00' },
          Thursday: { is_available: false, start_time: '09:00', end_time: '17:00' },
          Friday: { is_available: false, start_time: '09:00', end_time: '17:00' },
          Saturday: { is_available: false, start_time: '09:00', end_time: '17:00' },
          Sunday: { is_available: false, start_time: '09:00', end_time: '17:00' }
        };
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(slot => {
            if (slot.day_of_week && defaultAvailability[slot.day_of_week]) {
              defaultAvailability[slot.day_of_week] = {
                is_available: slot.is_available,
                start_time: slot.start_time.substring(0, 5),
                end_time: slot.end_time.substring(0, 5)
              };
            }
          });
        }

        this.availability = defaultAvailability;
        this.originalAvailability = JSON.parse(JSON.stringify(defaultAvailability));
      } catch (error) {
        console.error('Error fetching availability:', error);
        this.showError('Eroare la încărcarea programului. Vă rugăm să încercați din nou.');
      }
    },
    async saveAvailability() {
      try {
        const token = localStorage.getItem('token');
        const availabilityData = Object.entries(this.availability)
          .map(([day, data]) => ({
            day_of_week: day,
            start_time: data.start_time,
            end_time: data.end_time,
            is_available: data.is_available
          }));

        await axios.post('http://localhost:5000/api/availability/set', 
          { availabilityData },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        this.originalAvailability = JSON.parse(JSON.stringify(this.availability));
        this.showSuccess('Programul a fost salvat cu succes!');
      } catch (error) {
        console.error('Error saving availability:', error);
        this.showError('Eroare la salvarea programului. Vă rugăm să încercați din nou.');
      }
    },
    async fetchUpcomingAppointments() {
      try {
        const response = await axiosInstance.get('/api/appointments/upcoming');
        this.upcomingAppointments = response.data;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        this.loading = false;
        this.error = 'Nu s-au putut încărca programările. Vă rugăm să reîncărcați pagina.';
      }
    },
    async completeAppointment(appointmentId) {
      try {
        const cleanId = Number(appointmentId);
        
        if (isNaN(cleanId)) {
          console.error('Invalid appointment ID:', appointmentId);
          this.showError('ID de programare invalid');
          return;
        }
        
        console.log('Completing appointment with ID:', cleanId);
        await axiosInstance.put(`/api/appointments/${cleanId}/complete`);
        this.fetchUpcomingAppointments();
        this.showSuccess('Programarea a fost marcată ca finalizată');
      } catch (error) {
        console.error('Error completing appointment:', error);
        this.showError('Eroare la marcarea programării ca finalizată. Vă rugăm să încercați din nou.');
      }
    },
    async cancelAppointment(appointmentId) {
      try {
        const cleanId = Number(appointmentId);
        
        if (isNaN(cleanId)) {
          console.error('Invalid appointment ID:', appointmentId);
          this.showError('ID de programare invalid');
          return;
        }        
        console.log('Cancelling appointment with ID:', cleanId);
        await axiosInstance.put(`/api/appointments/${cleanId}/cancel`);
        this.fetchUpcomingAppointments();
        this.showSuccess('Programarea a fost anulată');
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        this.showError('Eroare la anularea programării. Vă rugăm să încercați din nou.');
      }
    },
    async declineAppointment(appointmentId) {
      try {
        const cleanId = Number(appointmentId);
        
        if (isNaN(cleanId)) {
          console.error('Invalid appointment ID:', appointmentId);
          this.showError('ID de programare invalid');
          return;
        }
        console.log('Declining appointment with ID:', cleanId);
        await axiosInstance.post(`/api/appointments/${cleanId}/decline`);
        this.fetchUpcomingAppointments();
        this.showSuccess('Programarea a fost refuzată');
      } catch (error) {
        console.error('Error declining appointment:', error);
        this.showError('Eroare la refuzarea programării. Vă rugăm să încercați din nou.');
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
    isTestFormValid() {
      const { patientId, testDate, testName, testCategory, parameters } = this.newTest;
      if (!patientId || !testDate || !testName || !testCategory || parameters.length === 0) {
        return false;
      }
      return parameters.every(param => 
        param.name && param.value !== undefined && param.value !== '' && param.unit);
    },
    addParameter() {
      this.newTest.parameters.push({
        name: '',
        value: '',
        unit: '',
        minReference: null,
        maxReference: null
      });
    },
    removeParameter(index) {
      this.newTest.parameters.splice(index, 1);
    },
    async submitTest() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/medical-tests', 
          this.newTest,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const accessCode = response.data.accessCode;
        let alertMessage = `Analiză medicală adăugată cu succes!\nCod de acces pentru pacient: ${accessCode}\nVă rugăm să comunicați acest cod pacientului pentru a putea accesa rezultatele.`;
        if (response.data.patientDetails) {
          const patient = response.data.patientDetails;
          alertMessage += `\n\nDetalii pacient (vizitator):\nNume: ${patient.name}\nEmail: ${patient.email}\nTelefon: ${patient.phone}`;
        }
        alert(alertMessage);
        this.newTest = {
          patientId: '',
          testDate: new Date().toISOString().slice(0, 10),
          testName: '',
          testCategory: '',
          notes: '',
          parameters: []
        };
      } catch (error) {
        console.error('Error creating medical test:', error);
        alert('Eroare la adăugarea analizei medicale. Vă rugăm să încercați din nou.');
      }
    },
    async handleSaveSchedule(scheduleData) {
      try {
        this.isLoading = true;
        
        const token = localStorage.getItem('token');
        
        await axios.post('http://localhost:5000/api/availability/set', 
          { schedule: scheduleData },  // Send the schedule data directly
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.showSuccess('Programul a fost salvat cu succes!');
        await this.fetchAvailability();
      } catch (error) {
        console.error('Error saving schedule:', error);
        this.showError('Eroare la salvarea programului. Vă rugăm să încercați din nou.');
      } finally {
        this.isLoading = false;
      }
    },
    async clearAllAvailability() {
      if (confirm('Sigur doriți să ștergeți tot programul de disponibilitate? Această acțiune nu poate fi anulată.')) {
        try {
          this.isLoading = true;
          const token = localStorage.getItem('token');
          const userId = this.user?.userId || this.user?.id;
          
          if (!token || !userId) {
            this.showError('Trebuie să fiți autentificat pentru a șterge programul');
            return;
          }
          
          const response = await axios.delete(`http://localhost:5000/api/availability/clear/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.status === 200) {
            this.showSuccess('Programul a fost șters cu succes!');
            this.fetchAvailability();
          }
        } catch (error) {
          console.error('Eroare la ștergerea programului:', error);
          this.showError('A apărut o eroare la ștergerea programului. Vă rugăm să încercați din nou.');
        } finally {
          this.isLoading = false;
        }
      }
    },
    showSuccess(message) {
      this.showToast(message, 'success');
    },
    
    showError(message) {
      this.showToast(message, 'error');
    },
    
    showToast(message, type = 'success') {
      if (this.toast.timeout) {
        clearTimeout(this.toast.timeout);
      }
      this.toast.show = true;
      this.toast.message = message;
      this.toast.type = type;
      this.toast.timeout = setTimeout(() => {
        this.toast.show = false;
      }, 4000);
    },
    editPersonal() {
      this.personalForm = {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        phone_number: this.user.phone_number || '',
        gender: this.user.gender || '',
        date_of_birth: this.user.date_of_birth || ''
      };
      this.editingPersonal = true;
    },
    async savePersonalInfo() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.put('http://localhost:5000/api/users/profile', 
          this.personalForm,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.user = { ...this.user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(this.user));
        
        this.editingPersonal = false;
        this.showToast('Informațiile personale au fost actualizate cu succes!', 'success');
      } catch (error) {
        console.error('Eroare la actualizarea informațiilor personale:', error);
        this.showToast('Eroare la actualizarea informațiilor personale. Vă rugăm să încercați din nou.', 'error');
      }
    },
    cancelEditPersonal() {
      this.editingPersonal = false;
    },
    editLocation() {
      this.locationForm = {
        address: this.user.address || '',
        city: this.user.city || '',
        county: this.user.county || ''
      };
      this.editingLocation = true;
    },
    async saveLocationInfo() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.put('http://localhost:5000/api/users/profile', 
          this.locationForm,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.user = { ...this.user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(this.user));
        
        this.editingLocation = false;
        this.showToast('Informațiile de locație au fost actualizate cu succes!', 'success');
      } catch (error) {
        console.error('Eroare la actualizarea informațiilor de locație:', error);
        this.showToast('Eroare la actualizarea informațiilor de locație. Vă rugăm să încercați din nou.', 'error');
      }
    },
    cancelEditLocation() {
      this.editingLocation = false;
    },
    async updatePassword() {
      if (!this.isPasswordFormValid) return;
      
      if (this.securityForm.newPassword !== this.securityForm.confirmPassword) {
        this.showToast('Parola nouă și confirmarea parolei nu se potrivesc.', 'error');
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        await axios.put('http://localhost:5000/api/users/change-password', {
          currentPassword: this.securityForm.currentPassword,
          newPassword: this.securityForm.newPassword
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.securityForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        this.showToast('Parola a fost actualizată cu succes!', 'success');
      } catch (error) {
        console.error('Eroare la actualizarea parolei:', error);
        this.showToast('Eroare la actualizarea parolei. Vă rugăm să verificați parola actuală și încercați din nou.', 'error');
      }
    },
    formatGender(gender) {
      if (!gender) return 'Nespecificat';
      return gender === 'M' ? 'Masculin' : gender === 'F' ? 'Feminin' : 'Altul';
    },
    resetRecordForm() {
      this.newRecord = {
        patient_id: '',
        diagnosis: '',
        prescription: '',
        notes: ''
      };
    },
    resetTestForm() {
      this.newTest = {
        patientId: '',
        testDate: new Date().toISOString().slice(0, 10),
        testName: '',
        testCategory: '',
        notes: '',
        parameters: []
      };
    }
  },
  mounted() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.fetchPatients()
        .then(() => this.fetchRecentRecords())
        .then(() => this.fetchAvailability())
        .then(() => this.fetchUpcomingAppointments())
        .catch(error => {
          console.error('Error initializing dashboard:', error);
        });
    } else {
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.doctor-dashboard {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #fffafa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
  margin-bottom: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brand:hover {
  transform: translateY(-1px);
}

.brand i {
  font-size: 1.8rem;
  color: white;
}

.role-badge {
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
  background: white;
  color: #dc2626;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.role-badge.doctor {
  background: white;
  color: #dc2626;
}

.role-badge.patient {
  background: white;
  color: #dc2626;
}

.dashboard-nav {
  display: flex;
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(220, 38, 38, 0.08);
  gap: 8px;
}

.nav-tab {
  padding: 12px 24px;
  white-space: nowrap;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.nav-tab i {
  font-size: 1.1rem;
  color: #dc2626;
  display: inline-block;
  vertical-align: middle;
}

.nav-tab span {
  display: inline-block;
  vertical-align: middle;
}

.nav-tab.active i {
  color: white;
}

.nav-tab:hover {
  background: #fee2e2;
  color: #dc2626;
}

.nav-tab.active {
  background: #dc2626;
  color: white;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(220, 38, 38, 0.08);
  margin-bottom: 24px;
  width: 100%;
}

.dashboard-section h3 {
  margin: 0 0 20px 0;
  color: #dc2626;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  position: relative;
  padding-bottom: 60px;
}

.info-item {
  background: #fff5f5;
  padding: 20px;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid #fee2e2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}

.info-item label {
  display: block;
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 4px;
  font-weight: 500;
}

.info-item span {
  color: #1a1a1a;
  font-weight: 500;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #dc2626;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #fecaca;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.05);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #dc2626;
  outline: none;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.submit-btn {
  background: #dc2626;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.15);
}

.submit-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.2);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Records section */
.records-list {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.record-item {
  background: #fff5f5;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid #fee2e2;
}

.record-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.record-date {
  font-weight: 600;
  color: #dc2626;
}

.patient-name {
  color: #64748b;
  font-size: 0.95rem;
}

/* Appointments section */
.appointments-list {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.appointment-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 3px solid #dc2626;
  transition: all 0.3s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.1);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.appointment-date {
  font-weight: 600;
  color: #dc2626;
}

.appointment-status {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
}

.appointment-status.scheduled {
  background-color: #fee2e2;
  color: #991b1b;
}

.appointment-status.completed {
  background-color: #fff5f5;
  color: #dc2626;
}

.appointment-status.cancelled {
  background-color: #fecaca;
  color: #7f1d1d;
}

.appointment-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.complete-btn, .cancel-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.complete-btn {
  background: #dc2626;
  color: white;
}

.complete-btn:hover {
  background: #b91c1c;
}

.cancel-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.cancel-btn:hover {
  background: #dc2626;
  color: white;
}

.logout-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: white;
  color: #dc2626;
  padding: 12px 24px;
  border: 2px solid #dc2626;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logout-btn i {
  font-size: 1.1rem;
}

.logout-btn span {
  display: inline-block;
  vertical-align: middle;
}

.logout-btn:hover {
  background: #dc2626;
  color: white;
  transform: translateY(-2px);
}

/* Parameters section */
.parameters-section {
  background: #fff5f5;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  border: 1px solid #fee2e2;
}

.parameter-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.parameter-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  align-items: center;
}

.add-param-btn, .remove-param-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-param-btn {
  background: #dc2626;
  color: white;
  border: none;
}

.add-param-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

.remove-param-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.remove-param-btn:hover {
  background: #dc2626;
  color: white;
}

@media (max-width: 768px) {
  .doctor-dashboard {
    padding: 16px;
    padding-bottom: 80px; /* Add padding to bottom to make room for fixed button */
  }

  .dashboard-header {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .dashboard-nav {
    padding: 8px;
  }

  .nav-tab {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-section {
    padding: 16px;
  }

  .records-list,
  .appointments-list {
    grid-template-columns: 1fr;
  }

  .parameter-inputs {
    grid-template-columns: 1fr;
  }

  .logout-btn {
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: calc(100% - 32px);
    justify-content: center;
    margin: 0;
  }
}

.dashboard-section[v-show="activeTab === 'availability'"] {
  grid-column: 1 / -1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.availability-section {
  width: 100%;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(220, 38, 38, 0.08);
  margin: 0 auto;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.availability-section h3 {
  margin-bottom: 1.5rem;
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.availability-section h3 i {
  color: #dc2626;
  font-size: 1.2rem;
}

/* Toast notifications */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.toast {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slide-in 0.3s ease-out;
  overflow: hidden;
  position: relative;
}

.toast::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  animation: timer 4s linear forwards;
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
}

.toast-icon {
  flex-shrink: 0;
  margin-right: 12px;
  font-size: 1.2rem;
}

.toast-message {
  flex-grow: 1;
  font-weight: 500;
  font-size: 0.95rem;
}

.toast-close {
  background: transparent;
  border: none;
  color: white;
  opacity: 0.8;
  cursor: pointer;
  margin-left: 12px;
  transition: all 0.2s;
}

.toast-close:hover {
  opacity: 1;
  transform: scale(1.1);
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes timer {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@media (max-width: 768px) {
  .toast-container {
    left: 20px;
    right: 20px;
    max-width: unset;
  }
  
  .availability-section {
    padding: 16px;
  }
}

.clear-all-button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.clear-all-button {
  padding: 12px 20px;
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-all-button:hover {
  background-color: #fecaca;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.clear-all-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-form {
  background: #fff5f5;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
}

.edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  color: #dc2626;
  border: 1px solid #dc2626;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-btn i {
  margin-right: 5px;
}

.edit-btn:hover {
  background: #dc2626;
  color: white;
  transform: translateY(-2px);
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.security-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.security-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #fecaca;
  box-sizing: border-box;
}

.security-button {
  background: #dc2626;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.15);
  min-width: 180px;
  width: 100%;
  max-width: 220px;
  text-align: center;
  box-sizing: border-box;
}

.security-button:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.2);
}

.security-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background-color: #e5e7eb;
  color: #9ca3af;
}

.security-form {
  background: #fff5f5;
  padding: 25px 20px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  margin: 30px auto;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
  box-sizing: border-box;
  overflow: hidden;
}

.security-form .form-group {
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.security-form input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #fecaca;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.05);
  box-sizing: border-box;
  margin: 0;
}

.security-form input:focus {
  border-color: #dc2626;
  outline: none;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.security-form input:hover {
  border-color: #dc2626;
}

.security-form label {
  display: block;
  text-align: left;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

/* Center the security section container */
.dashboard-section[v-show="activeTab === 'security'"] {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dashboard-section[v-show="activeTab === 'security'"] h3,
.dashboard-section[v-show="activeTab === 'security'"] .section-description {
  text-align: center;
  max-width: 600px;
  align-self: center;
}

/* Ensure dashboard sections take full width for consistent layout */
.dashboard-section[v-show="activeTab === 'profile'"],
.dashboard-section[v-show="activeTab === 'location'"],
.dashboard-section[v-show="activeTab === 'security'"] {
  width: 100%;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.section-description {
  color: #64748b;
  margin-bottom: 20px;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 800px;
  padding: 0 0 16px 0;
  border-bottom: 1px solid #fecaca;
  margin-top: -10px;
}

/* Add Record Form Styles */
.add-record-form {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.08);
  margin-top: 20px;
  border: 1px solid #fee2e2;
}

.section-description {
  color: #64748b;
  margin-bottom: 20px;
  font-size: 1rem;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fafafa;
  color: #334155;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
  outline: none;
  background-color: #fff;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}

.primary-btn {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.25);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
  padding: 14px 28px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

/* Add Test Section Styles */
.test-parameters {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
}

.test-parameters h4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #334155;
  font-size: 1.1rem;
}

.add-parameter-btn {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.add-parameter-btn:hover {
  background: #ef4444;
  transform: translateY(-1px);
}

.parameter-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.parameter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
}

.parameter-header span {
  font-weight: 600;
  color: #334155;
}

.remove-parameter-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-parameter-btn:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.no-parameters {
  text-align: center;
  padding: 20px;
  color: #64748b;
  background: white;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
}

.no-parameters i {
  color: #dc2626;
  margin-right: 6px;
}
</style> 