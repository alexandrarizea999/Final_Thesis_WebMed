<template>
  <div class="profile-dashboard" v-if="user">
    <div class="dashboard-header">
      <div class="brand">
        <i class="fas fa-hospital"></i>
      </div>
      <div class="role-badge" :class="user.role">{{ user.role === 'patient' ? 'pacient' : 'doctor' }}</div>
    </div>

    <div class="dashboard-nav">
      <button @click="activeTab = 'personal'" :class="['nav-tab', activeTab === 'personal' ? 'active' : '']">
        <i class="fas fa-user"></i>
        <span>Informații Personale</span>
      </button>
      <button @click="activeTab = 'location'" :class="['nav-tab', activeTab === 'location' ? 'active' : '']">
        <i class="fas fa-map-marker-alt"></i>
        <span>Locație</span>
      </button>
      <button @click="activeTab = 'security'" :class="['nav-tab', activeTab === 'security' ? 'active' : '']">
        <i class="fas fa-lock"></i>
        <span>Securitate</span>
      </button>
      <button @click="activeTab = 'records'" :class="['nav-tab', activeTab === 'records' ? 'active' : '']" v-if="user.role === 'patient'">
        <i class="fas fa-folder-open"></i>
        <span>Fișe Medicale</span>
      </button>
      <button @click="activeTab = 'tests'" :class="['nav-tab', activeTab === 'tests' ? 'active' : '']" v-if="user.role === 'patient'">
        <i class="fas fa-vial"></i>
        <span>Analize Medicale</span>
      </button>
      <button @click="activeTab = 'appointments'" :class="['nav-tab', activeTab === 'appointments' ? 'active' : '']">
        <i class="fas fa-calendar-check"></i>
        <span>Programări</span>
      </button>
      <button @click="activeTab = 'book-appointment'" :class="['nav-tab', activeTab === 'book-appointment' ? 'active' : '']" v-if="user.role === 'patient'">
        <i class="fas fa-plus-circle"></i>
        <span>Programare Nouă</span>
      </button>
      <button @click="activeTab = 'loyalty'" :class="['nav-tab', activeTab === 'loyalty' ? 'active' : '']" v-if="user.role === 'patient'">
        <i class="fas fa-star"></i>
        <span>Card de Fidelitate</span>
      </button>
    </div>

    <div class="dashboard-content">
      <!-- Personal Information Section -->
      <div class="dashboard-section" v-show="activeTab === 'personal'">
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

      <!-- Location Section -->
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

      <!-- Security Section -->
      <div class="dashboard-section" v-show="activeTab === 'security'">
        <h3>Securitate</h3>
        <div class="security-form">
          <div class="form-group">
            <label>Parolă Actuală:</label>
            <input type="password" v-model="securityForm.currentPassword">
          </div>
          <div class="form-group">
            <label>Parolă Nouă:</label>
            <input type="password" v-model="securityForm.newPassword">
          </div>
          <div class="form-group">
            <label>Confirmați Parola Nouă:</label>
            <input type="password" v-model="securityForm.confirmPassword">
          </div>
          <button @click="updatePassword" class="submit-btn" :disabled="!isPasswordFormValid">
            Actualizați Parola
          </button>
        </div>
      </div>

      <!-- Medical Records Section -->
      <div class="dashboard-section" v-show="activeTab === 'records' && user.role === 'patient'">
        <h3>Fișe Medicale</h3>
        <div class="records-list" v-if="medicalRecords.length > 0">
          <div v-for="record in medicalRecords" :key="record.id" class="record-item hover-effect">
            <div class="record-header">
              <span class="record-date">{{ formatDate(record.date) }}</span>
              <span class="doctor-name">Dr. {{ record.doctor_name }}</span>
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
          <p>Nu există fișe medicale disponibile.</p>
        </div>
      </div>

      <!-- Medical Tests Section -->
      <div class="dashboard-section" v-show="activeTab === 'tests' && user.role === 'patient'">
        <h3>Analize Medicale</h3>
        <p class="section-intro">Vizualizați rezultatele analizelor medicale și urmăriți valorile anormale.</p>
        <div class="action-buttons">
          <router-link to="/medical-tests" class="view-tests-btn">
            <span>Vezi Analizele Mele</span>
          </router-link>
        </div>
      </div>

      <!-- Appointments Section -->
      <div class="dashboard-section" v-show="activeTab === 'appointments'">
        <h3>Programări Viitoare</h3>
        <div class="action-buttons" v-if="user.role === 'patient'">
          <button @click="activeTab = 'book-appointment'" class="create-appointment-btn">
            <i class="fas fa-plus-circle"></i>
            <span>Programare Nouă</span>
          </button>
        </div>
        <div class="appointments-list" v-if="appointments.length > 0">
          <div v-for="appointment in appointments" 
               :key="appointment.id" 
               class="appointment-card">
            <div class="appointment-header">
              <div class="date-container">
                <div class="appointment-date">{{ formatDate(appointment.appointment_date) }}</div>
                <div class="appointment-time">{{ formatTime(appointment.appointment_time) }}</div>
              </div>
              <div class="appointment-status" :class="appointment.status">
                {{ appointment.status === 'scheduled' ? 'Programat' : 
                   appointment.status === 'completed' ? 'Finalizat' : 
                   appointment.status === 'declined' ? 'Refuzat' : 'Anulat' }}
              </div>
            </div>
            
            <div v-if="user.role === 'patient'" class="doctor-container">
              <div class="doctor-name">Dr. {{ appointment.doctor_name }}</div>
            </div>
            <div v-else class="patient-container">
              <div class="patient-name">{{ appointment.patient_name }}</div>
            </div>
            
            <div class="reason-container">
              <div class="appointment-reason">{{ appointment.reason }}</div>
            </div>
            
            <div class="appointment-actions" v-if="appointment.status === 'scheduled'">
              <button @click="cancelAppointment(appointment.id)" class="cancel-btn">
                Anulează
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-appointments">
          <p>Nu există programări viitoare</p>
        </div>
      </div>

      <!-- Book Appointment Section -->
      <div class="dashboard-section" v-show="activeTab === 'book-appointment' && user.role === 'patient'">
        <h3>Programare Nouă</h3>
        
        <div class="info-message">
          <i class="fas fa-info-circle"></i>
          <p>Medicii setează disponibilitatea în funcție de zilele săptămânii (Luni, Marți, etc.). Pentru a verifica disponibilitatea unui medic, selectați un medic și o dată.</p>
        </div>
        
        <div class="booking-form">
          <!-- Doctor Selection -->
          <div class="form-group">
            <label>Alege Medicul:</label>
            <select v-model="selectedDoctor" @change="fetchAvailableSlots" required>
              <option value="">Selectați un medic</option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                Dr. {{ doctor.user_profile ? `${doctor.user_profile.first_name} ${doctor.user_profile.last_name}` : doctor.email }}
              </option>
            </select>
          </div>
          
          <!-- Date Selection -->
          <div class="form-group">
            <label>Alege Data:</label>
            <input 
              type="date" 
              v-model="selectedDate" 
              :min="minDate"
              @change="fetchAvailableSlots"
              required
            >
          </div>
          
          <!-- Time Slot Selection -->
          <div class="form-group" v-if="availableSlots.length > 0">
            <label>Alege Ora:</label>
            <div class="slots-grid">
              <button 
                v-for="slot in availableSlots" 
                :key="slot.time" 
                @click="selectedSlot = slot.time" 
                :class="['slot-btn', selectedSlot === slot.time ? 'selected' : '']">
                {{ formatTime(slot.time) }}
              </button>
            </div>
          </div>
          <div v-else-if="selectedDoctor && selectedDate" class="no-slots">
            <p>Nu există sloturi disponibile pentru data selectată</p>
            <p class="help-text">Medicul nu este disponibil în această zi a săptămânii. Vă rugăm să încercați o altă zi.</p>
          </div>
          
          <!-- Appointment Reason -->
          <div class="form-group">
            <label>Motivul Programării:</label>
            <textarea v-model="appointmentReason" rows="3" placeholder="Descrieți pe scurt motivul programării" required></textarea>
          </div>
          
          <button @click="bookAppointment" class="submit-btn" :disabled="!canBookAppointment">
            Confirmă Programarea
          </button>
        </div>
      </div>

      <!-- Loyalty Card Section -->
      <div class="dashboard-section" v-show="activeTab === 'loyalty' && user.role === 'patient'">
        <h3><i class="fas fa-crown"></i> Card de Fidelitate</h3>
        
        <div v-if="loyaltyCard" class="loyalty-card-container">
          <div class="loyalty-card">
            <div class="loyalty-card-header">
              <i class="fas fa-crown"></i>
              <h4>Card de Fidelitate</h4>
            </div>
            <div class="loyalty-points">
              <span class="points-value">{{ loyaltyCard.points }}</span>
              <span class="points-label">puncte</span>
            </div>
            <div class="loyalty-total">
              <span>Total puncte acumulate: {{ loyaltyCard.total_earned_points }}</span>
            </div>
            <div class="loyalty-info">
              <p>Acumulați 10 puncte pentru fiecare programare finalizată</p>
            </div>
          </div>
          
          <div class="loyalty-packages-container">
            <h4><i class="fas fa-gift"></i> Beneficii Disponibile</h4>
            <p class="packages-info">Utilizați punctele de fidelitate pentru a obține următoarele beneficii medicale:</p>
            
            <div class="loyalty-packages" v-if="loyaltyPackages.length > 0">
              <div v-for="pkg in loyaltyPackages" :key="pkg.id" class="loyalty-package-card">
                <div class="package-name">{{ pkg.name }}</div>
                <div class="package-description">{{ pkg.description }}</div>
                <div class="package-footer">
                  <div class="package-points">
                    <span class="points-required">{{ pkg.points_required }}</span> puncte
                  </div>
                  <button 
                    @click="redeemPackage(pkg.id)" 
                    class="redeem-button"
                    :disabled="loyaltyCard.points < pkg.points_required">
                    {{ loyaltyCard.points >= pkg.points_required ? 'Utilizează Puncte' : 'Puncte Insuficiente' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="no-packages">
              <p><i class="fas fa-exclamation-circle"></i> Nu există pachete disponibile momentan</p>
            </div>
          </div>
          
          <div class="redemption-history-container" v-if="redemptionHistory.length > 0">
            <h4><i class="fas fa-history"></i> Istoric Utilizare</h4>
            <div class="redemption-list">
              <div v-for="redemption in redemptionHistory" :key="redemption.id" class="redemption-item">
                <div class="redemption-package">{{ redemption.package ? redemption.package.name : 'Pachet necunoscut' }}</div>
                <div class="redemption-date">{{ formatDate(redemption.redemption_date) }}</div>
                <div class="redemption-points">-{{ redemption.points_spent }} puncte</div>
                <div class="redemption-status" :class="redemption.status">{{ formatRedemptionStatus(redemption.status) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="loyalty-loading">
          <p><i class="fas fa-spinner fa-pulse"></i> Se încarcă informațiile cardului de fidelitate...</p>
        </div>
      </div>
    </div>

    <button @click="logout" class="logout-btn">
      <i class="fas fa-sign-out-alt"></i>
      <span>Deconectare</span>
    </button>
  </div>
  
  <div v-else class="dashboard-error">
    <p>Vă rugăm să vă autentificați pentru a vizualiza panoul de control.</p>
    <router-link to="/login" class="login-link">Mergeți la Autentificare</router-link>
  </div>
</template>

<script>
import axios from 'axios'
import LoyaltyService from '../services/LoyaltyService'

export default {
  name: 'ProfileDashboard',
  data() {
    return {
      user: null,
      activeTab: 'personal',
      securityForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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
      medicalRecords: [],
      appointments: [],
      loyaltyCard: null,
      loyaltyPackages: [],
      redemptionHistory: [],
      selectedDoctor: '',
      selectedDate: '',
      selectedSlot: '',
      appointmentReason: '',
      doctors: [],
      availableSlots: [],
    }
  },
  computed: {
    isPasswordFormValid() {
      return this.securityForm.currentPassword !== '' && 
        this.securityForm.newPassword !== '' && 
        this.securityForm.confirmPassword !== '' &&
        this.securityForm.newPassword === this.securityForm.confirmPassword;
    },
    isPersonalFormValid() {
      return this.personalForm.first_name && this.personalForm.last_name;
    },
    minDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    canBookAppointment() {
      return this.selectedDoctor && this.selectedDate && this.selectedSlot && this.appointmentReason;
    }
  },
  methods: {
    async fetchMedicalRecords() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/medical-records/my-records', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.medicalRecords = response.data;
      } catch (error) {
        console.error('Eroare la încărcarea fișelor medicale:', error);
      }
    },
    async fetchAppointments() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        let endpoint = 'appointments/my-appointments';
        if (this.user.role === 'doctor') {
          endpoint = 'appointments/doctor';
        }

        const response = await axios.get(`http://localhost:5000/api/${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.appointments = response.data;
      } catch (error) {
        console.error('Eroare la încărcarea programărilor:', error);
      }
    },
    async fetchDoctors() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/users/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.doctors = response.data;
      } catch (error) {
        console.error('Eroare la încărcarea listei de medici:', error);
      }
    },
    async cancelAppointment(appointmentId) {
      if (!confirm('Sunteți sigur că doriți să anulați această programare?')) {
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.fetchAppointments();
        alert('Programarea a fost anulată cu succes!');
      } catch (error) {
        console.error('Eroare la anularea programării:', error);
        alert('Eroare la anularea programării. Vă rugăm să încercați din nou.');
      }
    },
    async updatePassword() {
      if (!this.isPasswordFormValid) return;
      
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
        
        alert('Parola a fost actualizată cu succes!');
      } catch (error) {
        console.error('Eroare la actualizarea parolei:', error);
        alert('Eroare la actualizarea parolei. Vă rugăm să verificați parola actuală și încercați din nou.');
      }
    },
    formatGender(gender) {
      if (!gender) return 'Nespecificat';
      return gender === 'M' ? 'Masculin' : gender === 'F' ? 'Feminin' : 'Nespecificat';
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('ro-RO', options);
    },
    formatTime(timeString) {
      if (!timeString) return '';
      
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      
      return `${formattedHour}:${minutes} ${ampm}`;
    },
    formatRedemptionStatus(status) {
      switch(status) {
        case 'pending': return 'În așteptare';
        case 'completed': return 'Finalizat';
        case 'cancelled': return 'Anulat';
        case 'declined': return 'Refuzat';
        default: return status;
      }
    },
    async fetchLoyaltyCard() {
      try {
        const card = await LoyaltyService.getLoyaltyCard();
        this.loyaltyCard = card;
      } catch (error) {
        console.error('Error fetching loyalty card', error);
      }
    },
    async fetchLoyaltyPackages() {
      try {
        const packages = await LoyaltyService.getLoyaltyPackages();
        this.loyaltyPackages = packages;
      } catch (error) {
        console.error('Error fetching loyalty packages', error);
      }
    },
    async fetchRedemptionHistory() {
      try {
        const history = await LoyaltyService.getRedemptionHistory();
        this.redemptionHistory = history;
      } catch (error) {
        console.error('Error fetching redemption history', error);
      }
    },
    async redeemPackage(packageId) {
      try {
        const response = await LoyaltyService.redeemPackage(packageId);
        this.loyaltyCard.points = response.remaining_points;
        await this.fetchRedemptionHistory();
        this.$forceUpdate();
        alert('Beneficiu obținut cu succes! Veți fi contactat pentru detalii.');
      } catch (error) {
        console.error('Error redeeming package', error);
        alert('A apărut o eroare la obținerea beneficiului. Vă rugăm să încercați din nou.');
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/');
    },
    async fetchAvailableSlots() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:5000/api/appointments/available-slots?doctorId=${this.selectedDoctor}&date=${this.selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.availableSlots = response.data;
        this.selectedSlot = '';  
        console.log(`Fetched ${this.availableSlots.length} available slots`);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        this.availableSlots = [];
      }
    },
    async bookAppointment() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (!this.selectedDoctor || !this.selectedDate || !this.selectedSlot || !this.appointmentReason.trim()) {
          alert('Vă rugăm să completați toate câmpurile obligatorii');
          return;
        }

        const response = await axios.post('http://localhost:5000/api/appointments/book', {
          doctorId: this.selectedDoctor,
          appointmentDate: this.selectedDate,
          appointmentTime: this.selectedSlot,
          reason: this.appointmentReason
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        this.selectedDoctor = '';
        this.selectedDate = '';
        this.selectedSlot = '';
        this.appointmentReason = '';
        this.availableSlots = [];
        await this.fetchAppointments();
        this.activeTab = 'appointments';
        
        alert('Programarea a fost creată cu succes!');
      } catch (error) {
        console.error('Eroare la crearea programării:', error);
        alert('A apărut o eroare la crearea programării. Vă rugăm să încercați din nou.');
      }
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
    cancelEditPersonal() {
      this.editingPersonal = false;
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
        alert('Informațiile personale au fost actualizate cu succes!');
      } catch (error) {
        console.error('Eroare la actualizarea informațiilor personale:', error);
        alert('Eroare la actualizarea informațiilor personale. Vă rugăm să încercați din nou.');
      }
    },
    editLocation() {
      this.locationForm = {
        address: this.user.address || '',
        city: this.user.city || '',
        county: this.user.county || ''
      };
      this.editingLocation = true;
    },
    cancelEditLocation() {
      this.editingLocation = false;
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
        alert('Informațiile de locație au fost actualizate cu succes!');
      } catch (error) {
        console.error('Eroare la actualizarea informațiilor de locație:', error);
        alert('Eroare la actualizarea informațiilor de locație. Vă rugăm să încercați din nou.');
      }
    },
  },
  created() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.fetchAppointments();
      
      if (this.user.role === 'patient') {
        this.fetchMedicalRecords();
        this.fetchLoyaltyCard();
        this.fetchLoyaltyPackages();
        this.fetchRedemptionHistory();
        this.fetchDoctors();
      }
    }
  }
}
</script>

<style scoped>
.profile-dashboard {
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
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
}

.role-badge.patient {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
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
  transition: all 0.3s ease;
}

.nav-tab:hover {
  background: #fee2e2;
  color: #dc2626;
}

.nav-tab.active {
  background: #dc2626;
  color: white;
}

.nav-tab.active i {
  color: white;
}

.dashboard-content {
  flex: 1;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
}

/* Make loyalty section take full width */
.dashboard-content .dashboard-section[v-show="activeTab === 'loyalty'"] {
  grid-column: 1 / -1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 30px;
  box-sizing: border-box;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(220, 38, 38, 0.08);
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

.dashboard-section h3 i {
  color: #fcd34d;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  background: #fff5f5;
  padding: 20px;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid #fee2e2;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}

.info-item label {
  display: block;
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.info-item span {
  color: #1a1a1a;
  font-weight: 500;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 0;
  width: 100%;
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 10px;
  font-size: 1rem;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #fecaca;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.05);
  box-sizing: border-box;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-group select:hover,
.form-group input:hover,
.form-group textarea:hover {
  border-color: #dc2626;
}

.submit-btn {
  background: #dc2626;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.record-item {
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(204, 0, 0, 0.1);
}

.record-date {
  font-weight: 600;
  color: #cc0000;
}

.doctor-name, .patient-name {
  color: #990000;
  font-size: 0.9em;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.record-field label {
  font-weight: 600;
  color: #990000;
  font-size: 0.8em;
  text-transform: uppercase;
}

.view-tests-btn {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  text-decoration: none;
  padding: 12px 25px;
  border-radius: 25px;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s ease;
  text-align: center;
}

.view-tests-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #ff0000, #cc0000);
}

.appointments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.appointment-card {
  background-color: #fff8f8;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  box-shadow: 0 5px 15px rgba(204, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 4px solid #cc0000;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  width: 100%;
}

.date-container {
  display: flex;
  flex-direction: column;
}

.appointment-date {
  font-weight: 700;
  color: #cc0000;
  font-size: 1.1em;
}

.appointment-time {
  color: #990000;
  font-weight: 600;
  margin-top: 5px;
}

.appointment-status {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.appointment-status.scheduled {
  background-color: #e6ffe6;
  color: #006600;
}

.appointment-status.completed {
  background-color: #dcfce7;
  color: #166534;
}

.appointment-status.cancelled {
  background-color: #ffe6e6;
  color: #990000;
}

.appointment-status.declined {
  background-color: #fef3c7;
  color: #92400e;
}

.doctor-container, .patient-container {
  margin-bottom: 15px;
}

.reason-container {
  margin-bottom: 15px;
}

.appointment-reason {
  color: #333;
  font-size: 0.95em;
  line-height: 1.4;
}

.appointment-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  background: #f44336;
  color: white;
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-records, .no-appointments {
  text-align: center;
  color: #990000;
  padding: 25px;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  border-radius: 10px;
  font-style: italic;
}

.section-intro {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1em;
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

.dashboard-error {
  text-align: center;
  padding: 40px;
}

.login-link {
  display: inline-block;
  margin-top: 15px;
  color: #cc0000;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* Responsive styles */
@media (max-width: 768px) {
  .profile-dashboard {
    padding: 16px;
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

  .logout-btn {
    position: static;
    margin: 24px auto;
    width: 100%;
    justify-content: center;
  }
}

/* Loyalty Card Styles */
.loyalty-card-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.loyalty-card {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  text-align: center;
  margin-bottom: 20px;
}

.loyalty-card::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  background: rgba(255, 255, 255, 0.1);
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.loyalty-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.loyalty-card-header i {
  font-size: 1.8rem;
  color: #fcd34d;
}

.loyalty-card-header h4 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.loyalty-points {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px 0 20px;
}

.points-value {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.points-label {
  font-size: 1.4rem;
  opacity: 0.9;
  margin-top: 8px;
}

.loyalty-total {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
}

.loyalty-info {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 1rem;
  width: 100%;
  text-align: center;
  margin-top: 10px;
}

.loyalty-packages-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
  border: 1px solid #fee2e2;
  margin-bottom: 30px;
  width: 100%;
  box-sizing: border-box;
}

.loyalty-packages-container h4 {
  color: #dc2626;
  margin: 0 0 15px 0;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loyalty-packages-container h4 i {
  color: #fcd34d;
  font-size: 1.2rem;
}

.packages-info {
  color: #64748b;
  margin-bottom: 25px;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 800px;
}

.loyalty-packages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 15px;
}

.loyalty-package-card {
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.05);
  position: relative;
  min-height: 300px;
}

.loyalty-package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(220, 38, 38, 0.1);
}

.package-name {
  font-weight: 600;
  font-size: 1.2rem;
  color: #dc2626;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(220, 38, 38, 0.1);
  text-align: center;
}

.package-description {
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 20px;
  flex: 1;
  line-height: 1.5;
}

.package-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.package-points {
  font-size: 1rem;
  color: #64748b;
  padding: 10px 15px;
  background: rgba(220, 38, 38, 0.05);
  border-radius: 8px;
  display: block;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0;
}

.points-required {
  font-weight: 700;
  color: #dc2626;
  font-size: 1.2rem;
}

.redeem-button {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  font-size: 1rem;
  box-sizing: border-box;
  margin-top: 0;
}

.redeem-button:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.2);
}

.redeem-button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  color: #64748b;
}

.redemption-history-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
  border: 1px solid #fee2e2;
}

.redemption-history-container h4 {
  color: #dc2626;
  margin: 0 0 20px 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.redemption-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.redemption-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #fff5f5;
  border-radius: 10px;
  border: 1px solid #fecaca;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.redemption-package {
  font-weight: 500;
  color: #1a1a1a;
  flex: 1;
  min-width: 200px;
}

.redemption-date {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 15px;
  white-space: nowrap;
}

.redemption-points {
  font-weight: 600;
  color: #dc2626;
  margin: 0 15px;
  white-space: nowrap;
}

.redemption-status {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.redemption-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.redemption-status.completed {
  background: #d1fae5;
  color: #059669;
}

.redemption-status.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.redemption-status.declined {
  background: #fef3c7;
  color: #92400e;
}

.loyalty-loading {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
  font-size: 1.1rem;
}

.no-packages {
  text-align: center;
  padding: 40px 0;
  color: #64748b;
  font-style: italic;
}

/* Fixed grid layout for packages */
@media (min-width: 1200px) {
  .loyalty-packages {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .loyalty-packages {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .loyalty-packages {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .loyalty-packages {
    grid-template-columns: 1fr;
  }
  
  .redemption-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .redemption-date, .redemption-points, .redemption-status {
    margin: 5px 0;
  }
  
  .points-value {
    font-size: 3rem;
  }
  
  .loyalty-card-header h4 {
    font-size: 1.2rem;
  }
  
  .dashboard-content .dashboard-section[v-show="activeTab === 'loyalty'"] {
    padding: 20px;
  }
}

.action-buttons {
  margin-bottom: 25px;
  display: flex;
  gap: 15px;
}

.create-appointment-btn {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.create-appointment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(220, 38, 38, 0.2);
}

.create-appointment-btn i {
  font-size: 1.1rem;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background: #fff5f5;
  border-radius: 12px;
  border: 2px solid #fecaca;
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.1);
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 15px;
  width: 100%;
}

.slot-btn {
  background: white;
  border: 2px solid #fecaca;
  border-radius: 8px;
  padding: 14px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.05);
  width: 100%;
  text-align: center;
}

.slot-btn:hover {
  background: #fff5f5;
  border-color: #dc2626;
  transform: translateY(-2px);
}

.slot-btn.selected {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.15);
}

.submit-btn {
  padding: 16px 24px;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
  width: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.15);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #cbd5e1;
  color: #64748b;
}

.no-slots {
  text-align: center;
  color: #64748b;
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-top: 15px;
  border: 2px dashed #fecaca;
  font-style: italic;
}

/* Dashboard section specifically for appointment booking */
.dashboard-section[v-show="activeTab === 'book-appointment'"] {
  grid-column: 1 / -1;
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
}

@media (max-width: 768px) {
  .booking-form {
    padding: 20px;
    gap: 16px;
  }
  
  .form-group select,
  .form-group input,
  .form-group textarea {
    padding: 14px;
  }
  
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .slot-btn {
    padding: 12px 8px;
  }
  
  .dashboard-section[v-show="activeTab === 'book-appointment'"] {
    padding: 20px;
  }
}

.info-message {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.info-message i {
  color: #2196f3;
  font-size: 1.2rem;
}

.info-message p {
  margin: 0;
  font-size: 0.9rem;
}

.help-text {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

.edit-form {
  background: #fff5f5;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.edit-btn {
  background: white;
  color: #dc2626;
  border: 1px solid #dc2626;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 16px;
  display: block;
  width: fit-content;
  align-self: flex-end;
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
</style> 