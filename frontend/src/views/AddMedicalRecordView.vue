<template>
  <div class="add-medical-record-view">
    <AddMedicalRecordForm 
      :patients="patients" 
      @success="handleSuccess" 
      @error="handleError"
      @cancel="goBack"
    />
    <div v-if="toast.show" class="toast" :class="toast.type">
      <div class="toast-content">
        <i :class="['fas', toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle']"></i>
        <span>{{ toast.message }}</span>
      </div>
      <button class="toast-close" @click="toast.show = false">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>
<script>
import AddMedicalRecordForm from '../components/AddMedicalRecordForm.vue';
import axios from 'axios';
export default {
  name: 'AddMedicalRecordView',
  components: {
    AddMedicalRecordForm
  },
  data() {
    return {
      patients: [],
      toast: {
        show: false,
        message: '',
        type: 'success',
        timeout: null
      }
    };
  },
  mounted() {
    this.fetchPatients();
  },
  methods: {
    async fetchPatients() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.showToast('Sesiune expirată. Vă rugăm să vă autentificați din nou.', 'error');
          setTimeout(() => this.$router.push('/login'), 2000);
          return;
        }
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
        this.showToast('Eroare la încărcarea listei de pacienți', 'error');
      }
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
    handleSuccess(message) {
      this.showToast(message, 'success');
    },
    handleError(message) {
      this.showToast(message, 'error');
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.add-medical-record-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 450px;
  z-index: 9999;
  animation: slideIn 0.3s ease-out forwards;
}
.toast.success {
  background: #10b981;
  color: white;
}
.toast.error {
  background: #ef4444;
  color: white;
}
.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.toast-content i {
  font-size: 1.25rem;
}
.toast-close {
  background: transparent;
  border: none;
  color: white;
  opacity: 0.8;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;
}
.toast-close:hover {
  opacity: 1;
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@media (max-width: 768px) {
  .add-medical-record-view {
    padding: 1rem;
  } 
  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
    width: calc(100% - 2rem);
  }
}
</style> 