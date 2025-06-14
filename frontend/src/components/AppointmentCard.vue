<template>
  <div class="appointment-card">
    <div class="appointment-header">
      <div class="date-container">
        <div class="appointment-date">{{ formattedDate }}</div>
        <div class="appointment-time">{{ formattedTime }}</div>
      </div>
      <div 
        class="appointment-status" 
        :class="appointment.status"
      >
        {{ statusText }}
      </div>
    </div>
    <div class="appointment-content">
      <div class="doctor-info" v-if="showDoctorInfo">
        <div class="doctor-label">Dr.</div>
      </div>
      
      <div class="appointment-reason">{{ appointment.reason }}</div>
    </div>
    <div class="appointment-actions" v-if="appointment.status === 'scheduled' && isDoctor">
      <button @click="completeAppointment" class="complete-btn">
        Marchează ca Finalizată
      </button>
      <button @click="declineAppointment" class="decline-btn">
        Refuză
      </button>
      <button @click="cancelAppointment" class="cancel-btn">
        {{ cancelButtonText }}
      </button>
    </div>
  </div>
</template>
<script>
import axiosInstance from '../services/axios-config'
export default {
  name: 'AppointmentCard',
  props: {
    appointment: {
      type: Object,
      required: true
    },
    doctorName: {
      type: String,
      default: ''
    },
    patientName: {
      type: String,
      default: ''
    },
    isDoctor: {
      type: Boolean,
      default: false
    },
    showDoctorInfo: {
      type: Boolean,
      default: true
    },
    showPatientInfo: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    formattedDate() {
      if (!this.appointment.appointment_date) return '';
      const date = new Date(this.appointment.appointment_date);
      const day = date.getDate();
      const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 
                      'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    },
    formattedTime() {
      if (!this.appointment.appointment_time) return '';
      
      const [hours, minutes] = this.appointment.appointment_time.split(':');
      const hour = parseInt(hours, 10);
      const formattedHour = hour % 12 || 12;
      const period = hour >= 12 ? 'PM' : 'AM';
      
      return `${formattedHour}:${minutes} ${period}`;
    },
    statusText() {
      if (this.appointment.status === 'completed') {
        return 'Finalizat';
      }
      
      const statusMap = {
        'scheduled': 'Programat',
        'cancelled': 'Anulat',
        'declined': 'Refuzat'
      };
      
      return statusMap[this.appointment.status] || this.appointment.status;
    },
    cancelButtonText() {
      return this.isDoctor ? 'Anulează' : 'Anulează programarea';
    }
  },
  methods: {
    completeAppointment() {
      const idValue = this.appointment.id;
      let cleanId;
      if (typeof idValue === 'number') {
        cleanId = idValue;
      } else if (typeof idValue === 'string') {
        cleanId = parseInt(idValue.replace(/[^0-9]/g, ''), 10);
      } else {
        console.error('Invalid appointment ID type:', typeof idValue);
        return;
      }
      if (isNaN(cleanId)) {
        console.error('Could not parse appointment ID:', idValue);
        return;
      }
      console.log('Emitting complete event with clean ID:', cleanId);
      this.$emit('complete', cleanId);
    },
    cancelAppointment() {
      if (confirm('Sigur doriți să anulați această programare?')) {
        const idValue = this.appointment.id;
        let cleanId;
        if (typeof idValue === 'number') {
          cleanId = idValue;
        } else if (typeof idValue === 'string') {
          cleanId = parseInt(idValue.replace(/[^0-9]/g, ''), 10);
        } else {
          console.error('Invalid appointment ID type:', typeof idValue);
          return;
        }
        if (isNaN(cleanId)) {
          console.error('Could not parse appointment ID:', idValue);
          return;
        }
        console.log('Emitting cancel event with clean ID:', cleanId);
        this.$emit('cancel', cleanId);
      }
    },
    declineAppointment() {
      if (confirm('Sigur doriți să refuzați această programare?')) {
        const idValue = this.appointment.id;
        let cleanId;
        if (typeof idValue === 'number') {
          cleanId = idValue;
        } else if (typeof idValue === 'string') {
          cleanId = parseInt(idValue.replace(/[^0-9]/g, ''), 10);
        } else {
          console.error('Invalid appointment ID type:', typeof idValue);
          return;
        }
        if (isNaN(cleanId)) {
          console.error('Could not parse appointment ID:', idValue);
          return;
        }
        console.log('Emitting decline event with clean ID:', cleanId);
        this.$emit('decline', cleanId);
      }
    }
  }
}
</script>

<style scoped>
.appointment-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border-left: 4px solid #dc2626;
  position: relative;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff5f5;
}

.date-container {
  display: flex;
  flex-direction: column;
}

.appointment-date {
  font-weight: 600;
  color: #dc2626;
  font-size: 1rem;
}

.appointment-time {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 2px;
}

.appointment-status {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.appointment-status.scheduled {
  background-color: #dbeafe;
  color: #1e40af;
}

.appointment-status.completed {
  background-color: #dcfce7;
  color: #166534;
}

.appointment-status.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.appointment-status.declined {
  background-color: #fef3c7;
  color: #92400e;
}

.appointment-content {
  padding: 12px 16px;
}

.doctor-info {
  display: flex;
  margin-bottom: 4px;
}

.doctor-label {
  font-weight: 500;
  color: #374151;
}

.doctor-name {
  color: #1f2937;
}

.patient-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 6px;
}

.reason-container {
  margin-top: 8px;
}

.appointment-reason {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.3;
}

.appointment-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  background-color: #fafafa;
}

.complete-btn, .cancel-btn, .decline-btn {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.complete-btn {
  background-color: #16a34a;
  color: white;
}

.complete-btn:hover {
  background-color: #15803d;
}

.decline-btn {
  background-color: #f59e0b;
  color: white;
}

.decline-btn:hover {
  background-color: #d97706;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
  color: #4b5563;
}

@media (max-width: 640px) {
  .appointment-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .appointment-status {
    margin-top: 8px;
  }
  
  .appointment-actions {
    flex-direction: column;
  }
}
</style> 