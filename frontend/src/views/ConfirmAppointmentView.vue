<template>
  <div class="confirm-appointment">
    <div class="confirm-container">
      <h2>Confirmare Programare</h2>
      <p class="confirm-intro">Introduceți ID-ul programării și codul de confirmare pentru a confirma sau verifica statusul programării dvs.</p>
      <div v-if="!appointmentDetails">
        <form @submit.prevent="verifyAppointment" class="confirm-form">
          <div class="form-group">
            <label>ID Programare*</label>
            <input type="number" v-model="formData.appointmentId" required>
          </div>
          
          <div class="form-group">
            <label>Cod de Confirmare*</label>
            <input type="text" v-model="formData.confirmationCode" required>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-verify">Verifică Programarea</button>
          </div>
        </form>
      </div>
      <div v-else class="appointment-details">
        <h3>Detalii Programare</h3>
        <div class="details-card">
          <div class="details-row">
            <span class="details-label">Nume:</span>
            <span class="details-value">{{ appointmentDetails.firstName }} {{ appointmentDetails.lastName }}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Specialitate:</span>
            <span class="details-value">{{ appointmentDetails.specialty }}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Data preferată:</span>
            <span class="details-value">{{ formatDate(appointmentDetails.preferredDate) }}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Status:</span>
            <span :class="['status-badge', statusClass]">{{ translateStatus(appointmentDetails.status) }}</span>
          </div>
        </div>
        <div v-if="appointmentDetails.status === 'pending'" class="confirmation-actions">
          <p>Programarea dvs. este în așteptare. Doriți să o confirmați acum?</p>
          <button @click="confirmAppointment" class="btn-confirm">Confirmă Programarea</button>
        </div>
        
        <div v-else-if="appointmentDetails.status === 'confirmed'" class="confirmation-message">
          <p>Programarea dvs. a fost confirmată. Vă mulțumim!</p>
        </div>
        
        <div v-else-if="appointmentDetails.status === 'cancelled'" class="confirmation-message">
          <p>Programarea dvs. a fost anulată.</p>
        </div>
        <button @click="resetForm" class="btn-back">Înapoi</button>
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  name: 'ConfirmAppointmentView',
  data() {
    return {
      formData: {
        appointmentId: '',
        confirmationCode: ''
      },
      appointmentDetails: null,
      error: null
    }
  },
  computed: {
    statusClass() {
      const statusClasses = {
        'pending': 'status-pending',
        'confirmed': 'status-confirmed',
        'cancelled': 'status-cancelled'
      };
      return statusClasses[this.appointmentDetails?.status] || '';
    }
  },
  methods: {
    async verifyAppointment() {
      this.error = null;
      try {
        const { appointmentId, confirmationCode } = this.formData;
        const response = await axios.get(
          `http://localhost:5000/api/visitor-appointment/status/${appointmentId}/${confirmationCode}`
        ); 
        this.appointmentDetails = response.data.appointment;
      } catch (error) {
        console.error('Verificare eșuată:', error);
        if (error.response?.status === 404) {
          this.error = 'Programarea nu a fost găsită. Verificați ID-ul și codul de confirmare.';
        } else if (error.response?.status === 400) {
          this.error = 'Cod de confirmare invalid. Vă rugăm să verificați și să încercați din nou.';
        } else {
          this.error = 'A apărut o eroare la verificarea programării. Vă rugăm să încercați din nou.';
        }
      }
    },
    async confirmAppointment() {
      try {
        const { appointmentId, confirmationCode } = this.formData;
        const response = await axios.post(
          `http://localhost:5000/api/visitor-appointment/confirm/${appointmentId}/${confirmationCode}`
        );
        this.appointmentDetails = response.data.appointment;
      } catch (error) {
        console.error('Confirmare eșuată:', error);
        this.error = 'A apărut o eroare la confirmarea programării. Vă rugăm să încercați din nou.';
      }
    },
    resetForm() {
      this.appointmentDetails = null;
      this.formData = {
        appointmentId: '',
        confirmationCode: ''
      };
      this.error = null;
    },
    
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ro-RO', options);
    },
    translateStatus(status) {
      const translations = {
        'pending': 'În așteptare',
        'confirmed': 'Confirmată',
        'cancelled': 'Anulată'
      };
      return translations[status] || status;
    }
  }
}
</script>

<style scoped>
.confirm-appointment {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 40px 20px;
}

.confirm-container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  transition: all 0.3s ease;
}

h2 {
  margin: 0 0 30px;
  color: #cc0000;
  font-size: 2em;
  text-align: center;
  background: linear-gradient(45deg, #cc0000, #ff0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h3 {
  color: #cc0000;
  margin-bottom: 20px;
}

.confirm-intro {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.confirm-form {
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
  color: #990000;
  font-weight: 600;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  padding: 12px 15px;
  border: 2px solid #ffeeee;
  border-radius: 8px;
  font-size: 1rem;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #cc0000;
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.btn-verify, .btn-confirm, .btn-back {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.2);
}

.btn-back {
  background: #666;
  margin-top: 20px;
}

.btn-verify:hover, .btn-confirm:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.3);
}

.btn-back:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.appointment-details {
  text-align: center;
}

.details-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.details-row {
  display: flex;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.details-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.details-label {
  flex: 1;
  font-weight: 600;
  color: #666;
}

.details-value {
  flex: 2;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.confirmation-actions, .confirmation-message {
  margin: 25px 0;
}

.confirmation-message p {
  padding: 10px;
  border-radius: 8px;
}

.error-message {
  background: #fff0f0;
  border-left: 5px solid #cc0000;
  color: #cc0000;
  padding: 15px;
  margin: 20px 0 0;
  border-radius: 5px;
}

@media (max-width: 600px) {
  .confirm-container {
    padding: 30px 20px;
  }
  
  h2 {
    font-size: 1.8em;
  }
}
</style> 