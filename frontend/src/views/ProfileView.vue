<template>
  <div class="profile" v-if="user">
    <div class="profile-header">
      <div class="brand">
        <i class="fas fa-hospital"></i>
      </div>
      <div style="display: inline-block; padding: 8px 16px; border-radius: 30px; font-size: 0.9rem; font-weight: 500; 
                  text-transform: capitalize; background: linear-gradient(135deg, #dc2626, #b91c1c) !important; 
                  color: white !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        {{ user.role === 'patient' ? 'Pacient' : 'Medic' }}
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-section" v-motion-slide-visible>
        <h3>Personal Information</h3>
        <div class="info-grid">
          <div class="info-item hover-effect">
            <label>Name:</label>
            <span>{{ user.first_name }} {{ user.last_name }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Email:</label>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Phone:</label>
            <span>{{ user.phone_number || 'Not provided' }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>Gender:</label>
            <span>{{ formatGender(user.gender) }}</span>
          </div>
        </div>
      </div>

      <div class="profile-section" v-motion-slide-visible>
        <h3>Location</h3>
        <div class="info-grid">
          <div class="info-item hover-effect">
            <label>Address:</label>
            <span>{{ user.address || 'Not provided' }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>City:</label>
            <span>{{ user.city || 'Not provided' }}</span>
          </div>
          <div class="info-item hover-effect">
            <label>County:</label>
            <span>{{ user.county || 'Not provided' }}</span>
          </div>
        </div>
      </div>

      <div class="profile-section" v-motion-slide-visible v-if="user.role === 'patient'">
        <h3>Book Appointment</h3>
        <div class="appointment-booking">
          <div class="form-group">
            <label>Select Doctor:</label>
            <select v-model="selectedDoctor" @change="fetchDoctorAvailability">
              <option value="">Choose a doctor</option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor">
                Dr. {{ doctor.first_name }} {{ doctor.last_name }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="selectedDoctor">
            <label>Select Date:</label>
            <input type="date" v-model="selectedDate" @change="checkAvailableSlots" 
                   :min="minDate" required>
          </div>
          <div class="form-group" v-if="selectedDoctor && selectedDate">
            <label>Available Time Slots:</label>
            <div class="time-slots" v-if="availableSlots.length > 0">
              <button v-for="slot in availableSlots" 
                      :key="slot.time"
                      :class="['time-slot', { selected: selectedSlot === slot.time }]"
                      @click="selectedSlot = slot.time">
                {{ formatTime(slot.time) }}
              </button>
            </div>
            <p v-else class="no-slots">No available slots for this date</p>
          </div>
          <div class="form-group" v-if="selectedSlot">
            <label>Reason for Visit:</label>
            <textarea v-model="appointmentReason" rows="3" required></textarea>
          </div>
          <button @click="bookAppointment" 
                  class="book-btn"
                  :disabled="!canBook">
            Book Appointment
          </button>
        </div>
        <div class="upcoming-appointments" v-if="appointments.length > 0">
          <h4>Upcoming Appointments</h4>
          <div class="appointments-list">
            <div v-for="appointment in appointments" 
                 :key="appointment.id" 
                 class="appointment-card">
              <div class="appointment-header">
                <div class="date-container">
                  <div class="appointment-date">{{ formatDate(appointment.appointment_date) }}</div>
                  <div class="appointment-time">{{ formatTime(appointment.appointment_time) }}</div>
                </div>
                <div class="appointment-status" :class="appointment.status">
                  {{ appointment.status }}
                </div>
              </div>
              
              <div class="doctor-container">
                <div class="doctor-name">Dr. {{ appointment.doctor_name }}</div>
              </div>
              
              <div class="reason-container">
                <div class="appointment-reason">{{ appointment.reason }}</div>
              </div>
              
              <div v-if="appointment.status === 'scheduled'" class="appointment-actions">
                <button @click="cancelAppointment(appointment.id)" class="cancel-btn">
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="no-appointments">No upcoming appointments</p>
      </div>

      <div class="profile-section" v-motion-slide-visible v-if="user.role === 'patient'">
        <h3>Medical Records</h3>
        <div class="records-list" v-if="medicalRecords.length > 0">
          <div v-for="record in medicalRecords" :key="record.id" class="record-item hover-effect">
            <div class="record-header">
              <span class="record-date">{{ formatDate(record.date) }}</span>
              <span class="doctor-name">Dr. {{ record.doctor_name }}</span>
            </div>
            <div class="record-content">
              <div class="record-field">
                <label>Diagnosis:</label>
                <span>{{ record.diagnosis }}</span>
              </div>
              <div class="record-field" v-if="record.prescription">
                <label>Prescription:</label>
                <span>{{ record.prescription }}</span>
              </div>
              <div class="record-field" v-if="record.notes">
                <label>Notes:</label>
                <span>{{ record.notes }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-records">
          <p>No medical records available.</p>
        </div>
      </div>

      <div class="profile-section" v-motion-slide-visible v-if="user.role === 'patient'">
        <h3>Medical Tests</h3>
        <p class="section-intro">View your medical test results and track abnormal values.</p>
        <div class="action-buttons">
          <router-link to="/medical-tests" class="view-tests-btn">
            <span>View My Medical Tests</span>
          </router-link>
        </div>
      </div>
    </div>

    <button @click="logout" class="logout-btn">
      <span>Logout</span>
    </button>
  </div>
  <div v-else class="profile-error">
    <p>Please log in to view your profile.</p>
    <router-link to="/login" class="login-link">Go to Login</router-link>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProfileView',
  data() {
    return {
      user: null,
      medicalRecords: [],
      doctors: [],
      selectedDoctor: null,
      selectedDate: '',
      selectedSlot: null,
      appointmentReason: '',
      availableSlots: [],
      appointments: []
    }
  },
  computed: {
    roleTitle() {
      if (!this.user) return '';
      return this.user.role === 'doctor' ? 'Doctor Profile' : 'Patient Profile';
    },
    minDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    canBook() {
      return this.selectedDoctor && 
             this.selectedDate && 
             this.selectedSlot && 
             this.appointmentReason.trim();
    }
  },
  methods: {
    formatGender(gender) {
      if (!gender) return 'Not provided';
      const genderMap = {
        'M': 'Male',
        'F': 'Female',
        'Other': 'Other'
      };
      return genderMap[gender] || gender;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
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
        console.error('Error fetching medical records:', error);
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
    async fetchDoctors() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/doctors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.doctors = response.data;
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    },
    async fetchDoctorAvailability() {
      if (!this.selectedDoctor) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/availability/${this.selectedDoctor.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.checkAvailableSlots();
      } catch (error) {
        console.error('Error fetching doctor availability:', error);
      }
    },
    async checkAvailableSlots() {
      if (!this.selectedDoctor || !this.selectedDate) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/appointments/available-slots`, {
            params: {
              doctorId: this.selectedDoctor.id,
              date: this.selectedDate
            },
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        this.availableSlots = response.data;
      } catch (error) {
        console.error('Error checking available slots:', error);
      }
    },
    async bookAppointment() {
      if (!this.canBook) return;

      try {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://localhost:5000/api/appointments/book',
          {
            doctorId: this.selectedDoctor.id,
            appointmentDate: this.selectedDate,
            appointmentTime: this.selectedSlot,
            reason: this.appointmentReason
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.selectedDoctor = null;
        this.selectedDate = '';
        this.selectedSlot = null;
        this.appointmentReason = '';
        this.fetchAppointments();
        
        alert('Appointment booked successfully!');
      } catch (error) {
        console.error('Error booking appointment:', error);
        alert('Error booking appointment. Please try again.');
      }
    },
    async fetchAppointments() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/appointments/my-appointments',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.appointments = response.data;
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    },
    async cancelAppointment(appointmentId) {
      if (!confirm('Are you sure you want to cancel this appointment?')) return;

      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
          {},
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.fetchAppointments();
        alert('Appointment cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Error cancelling appointment. Please try again.');
      }
    },
    formatTime(time) {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  created() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      if (this.user.role === 'patient') {
        this.fetchMedicalRecords();
        this.fetchDoctors();
        this.fetchAppointments();
      }
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-header {
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

.profile-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.profile-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.1);
}

.profile-section h3 {
  margin-top: 0;
  color: #cc0000;
  font-size: 1.5em;
  border-bottom: 2px solid #ffeeee;
  padding-bottom: 15px;
  margin-bottom: 25px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: 10px;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
}

.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(204, 0, 0, 0.1);
}

.info-item label {
  font-weight: 600;
  color: #990000;
  margin-bottom: 8px;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #660000;
  font-size: 1.1em;
}

.logout-btn {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  margin-top: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.3);
  background: linear-gradient(135deg, #ff0000, #cc0000);
}

.logout-btn:active {
  transform: translateY(1px);
}

.profile-error {
  text-align: center;
  padding: 40px;
  animation: fadeIn 0.5s ease-out;
}

.login-link {
  display: inline-block;
  margin-top: 15px;
  color: #cc0000;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
}

.login-link:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #cc0000;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.login-link:hover:after {
  transform: scaleX(1);
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

.doctor-name {
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
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.record-field span {
  color: #660000;
  font-size: 1em;
  line-height: 1.4;
}

.no-records {
  text-align: center;
  color: #990000;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  border-radius: 10px;
  font-style: italic;
}

.appointment-booking {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(204, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #990000;
}

.form-group select, 
.form-group input[type="date"], 
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ffeeee;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s ease;
  font-family: inherit;
  color: #333;
}

.form-group select:focus, 
.form-group input[type="date"]:focus, 
.form-group textarea:focus {
  border-color: #cc0000;
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
  outline: none;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 15px;
}

.time-slot {
  padding: 12px;
  border: 2px solid #ffeeee;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 500;
}

.time-slot:hover {
  border-color: #cc0000;
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(204, 0, 0, 0.1);
}

.time-slot.selected {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  border-color: #990000;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(204, 0, 0, 0.2);
}

.book-btn {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  padding: 14px 35px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  align-self: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(204, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.book-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.3);
  background: linear-gradient(135deg, #ff0000, #cc0000);
}

.book-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upcoming-appointments h4 {
  color: #990000;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
  font-size: 1.3em;
  text-align: center;
}

.upcoming-appointments h4:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #cc0000, transparent);
}

.appointments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
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
  background-color: #e6f3ff;
  color: #004d99;
}

.appointment-status.cancelled {
  background-color: #ffe6e6;
  color: #990000;
}

.doctor-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.doctor-name {
  font-weight: 600;
  color: #660066;
  font-size: 1em;
  position: relative;
  padding-left: 25px;
}

.doctor-name::before {
  content: "👨‍⚕️";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1em;
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

.no-appointments, .no-slots {
  text-align: center;
  color: #990000;
  padding: 25px;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  border-radius: 10px;
  font-style: italic;
  margin-top: 15px;
  box-shadow: 0 3px 10px rgba(204, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;
  transition: all 0.3s ease;
}

.no-appointments:hover, .no-slots:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(204, 0, 0, 0.15);
}

.no-appointments:before, .no-slots:before {
  content: "📅";
  display: block;
  font-size: 2em;
  margin-bottom: 10px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .appointments-list {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .time-slots {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .profile-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .appointment-card {
    padding: 20px 15px;
  }
  
  .appointment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .appointment-time {
    align-self: flex-start;
  }
  
  .appointment-status {
    position: static;
    margin-top: 15px;
    display: inline-block;
  }
  
  .cancel-btn {
    align-self: center;
    width: 100%;
  }
}

.appointment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(204, 0, 0, 0.2);
}

.section-intro {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.action-buttons {
  display: flex;
  margin-top: 15px;
}

.view-tests-btn {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  text-decoration: none;
  padding: 12px 25px;
  border-radius: 25px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.2);
}

.view-tests-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.3);
  background: linear-gradient(135deg, #ff0000, #cc0000);
}
</style> 