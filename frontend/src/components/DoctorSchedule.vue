<template>
  <div class="schedule-container">
    <h2 class="schedule-title">Program de Lucru</h2>
    
    <div class="info-alert">
      <i class="fas fa-info-circle"></i>
      <div>
        <strong>Important:</strong> Când selectați o zi în calendar, configurați disponibilitatea pentru <em>toate zilele din săptămână</em> care cad în aceeași zi a săptămânii (ex: toate zilele de Luni, toate zilele de Marți, etc.)
        <p class="mt-2">Pentru a configura programul corect pentru pacienți, setați disponibilitatea pentru fiecare zi a săptămânii în care doriți să primiți programări.</p>
      </div>
    </div>
    
    <div class="schedule-wrapper">
      <div class="calendar-container">
        <div class="calendar-header">
          <i class="fas fa-calendar-alt"></i>
          <span>Selectează zilele disponibile</span>
        </div>
        <date-picker 
          v-model="selectedDate" 
          :attributes="dateAttributes"
          :min-date="new Date()"
          @dayclick="onDateSelect"
          color="red"
          is-expanded
          mode="date"
        />
      </div>
      
      <div class="time-schedule-container">
        <div class="selected-date" v-if="selectedDate">
          <h3>
            <i class="fas fa-calendar-day"></i>
            {{ formatDate(selectedDate) }}
            <span class="weekday-label">({{ getDayOfWeek(selectedDate) }})</span>
          </h3>
        </div>
        
        <div class="schedule-controls">
          <div class="availability-toggle">
            <label class="toggle-container">
              <input 
                type="checkbox" 
                v-model="isDayAvailable" 
                @change="updateAvailability"
              >
              <span class="toggle-label">Disponibil în fiecare zi de {{ getDayOfWeek(selectedDate) }}</span>
            </label>
          </div>
          
          <div class="time-inputs" v-if="isDayAvailable">
            <div class="time-field">
              <label for="startTime">
                <i class="fas fa-clock"></i> Program de la:
              </label>
              <input 
                type="time" 
                id="startTime"
                v-model="startTime" 
                class="time-input"
                @change="updateTimeSlot"
              />
            </div>
            <div class="time-field">
              <label for="endTime">
                <i class="fas fa-clock"></i> Până la:
              </label>
              <input 
                type="time" 
                id="endTime"
                v-model="endTime" 
                class="time-input"
                @change="updateTimeSlot"
              />
            </div>
          </div>
        </div>
        
        <div class="schedule-summary">
          <h4>Program Configurat</h4>
          <div class="scheduled-days">
            <div v-for="(slot, date) in scheduledDays" :key="date" class="scheduled-day-item">
              <div class="day-info">
                <span class="day-date">{{ getDayOfWeek(new Date(date)) }}</span>
                <span class="day-hours">{{ slot.start }} - {{ slot.end }}</span>
              </div>
              <button class="remove-day-btn" @click="removeScheduledDay(date)" :disabled="isSaving" title="Șterge ziua">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div v-if="Object.keys(scheduledDays).length === 0" class="no-days">
              Nu aveți zile programate
            </div>
          </div>
          
          <div class="clear-all-container" v-if="Object.keys(scheduledDays).length > 0">
            <button class="clear-all-button" @click="clearAllSchedule" :disabled="isSaving">
              <i class="fas fa-trash-alt"></i> Șterge tot programul
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <button class="save-button" @click="saveSchedule" :disabled="isSaving || Object.keys(scheduledDays).length === 0">
      <span v-if="isSaving">
        <i class="fas fa-spinner fa-spin"></i> Salvare în curs...
      </span>
      <span v-else>
        <i class="fas fa-save"></i> Salvează Program
      </span>
    </button>
  </div>
</template>

<script>
import { DatePicker } from 'v-calendar';

export default {
  name: 'DoctorSchedule',
  components: {
    DatePicker
  },
  props: {
    existingSchedule: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedDate: new Date(),
      isDayAvailable: false,
      startTime: '09:00',
      endTime: '17:00',
      scheduledDays: {},
      isSaving: false
    }
  },
  computed: {
    dateAttributes() {
      const attributes = [];
      for (const dateStr in this.scheduledDays) {
        attributes.push({
          dot: {
            color: 'red',
            class: 'scheduled-day-dot'
          },
          dates: new Date(dateStr)
        });
      }
      
      return attributes;
    }
  },
  created() {
    this.initializeSchedule();
  },
  methods: {
    initializeSchedule() {
      if (this.existingSchedule && this.existingSchedule.length > 0) {
        this.existingSchedule.forEach(item => {
          if (item.is_available) {
            const dates = this.getNextFewDatesForDayOfWeek(item.day_of_week);
            dates.forEach(date => {
              const dateStr = this.dateToString(date);
              this.scheduledDays[dateStr] = {
                start: item.start_time.substring(0, 5),
                end: item.end_time.substring(0, 5)
              };
            });
          }
        });
      }
    },
    getNextFewDatesForDayOfWeek(dayOfWeek) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndex = days.indexOf(dayOfWeek);
      if (dayIndex === -1) return [];
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 4; i++) {
        const date = new Date(today);
        const diff = (dayIndex + 7 - date.getDay()) % 7;
        date.setDate(date.getDate() + diff + (i * 7));
        dates.push(date);
      }
      return dates;
    },
    onDateSelect(day) {
      this.selectedDate = day.date;
      const dateStr = this.dateToString(this.selectedDate);
      if (this.scheduledDays[dateStr]) {
        this.isDayAvailable = true;
        this.startTime = this.scheduledDays[dateStr].start;
        this.endTime = this.scheduledDays[dateStr].end;
      } else {
        this.isDayAvailable = false;
        this.startTime = '09:00';
        this.endTime = '17:00';
      }
    },
    updateAvailability() {
      const dateStr = this.dateToString(this.selectedDate);
      if (this.isDayAvailable) {
        this.scheduledDays[dateStr] = {
          start: this.startTime,
          end: this.endTime
        };
      } else {
        if (this.scheduledDays[dateStr]) {
          delete this.scheduledDays[dateStr];
        }
      }
    },
    updateTimeSlot() {
      if (this.isDayAvailable) {
        const dateStr = this.dateToString(this.selectedDate);
        this.scheduledDays[dateStr] = {
          start: this.startTime,
          end: this.endTime
        };
      }
    },
    removeScheduledDay(dateStr) {
      if (this.scheduledDays[dateStr]) {
        delete this.scheduledDays[dateStr];
      }
      if (this.dateToString(this.selectedDate) === dateStr) {
        this.isDayAvailable = false;
      }
    },
    clearAllSchedule() {
      if (confirm('Sigur doriți să ștergeți tot programul configurat?')) {
        this.scheduledDays = {};
        this.isDayAvailable = false;
      }
    },
    dateToString(date) {
      return date.toISOString().split('T')[0];
    },
    formatDate(date) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('ro-RO', options);
    },
    getDayOfWeek(date) {
      const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
      return days[date.getDay()];
    },
    saveSchedule() {
      this.isSaving = true;
      const schedule = {};
      
      for (const dateStr in this.scheduledDays) {
        const date = new Date(dateStr);
        const dayOfWeek = this.getDayOfWeekInEnglish(date);
        if (!schedule[dayOfWeek]) {
          schedule[dayOfWeek] = {
            start: this.scheduledDays[dateStr].start,
            end: this.scheduledDays[dateStr].end
          };
        }
      }
      this.$emit('save', schedule);
      setTimeout(() => {
        this.isSaving = false;
      }, 1000);
    },
    getDayOfWeekInEnglish(date) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }
  }
}
</script>

<style scoped>
.schedule-container {
  background-color: transparent;
  border-radius: 12px;
  padding: 0;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  border: none;
  box-shadow: none;
}

.schedule-title {
  color: #dc2626;
  font-size: 1.5rem;
  margin-bottom: 20px;
  font-weight: 600;
  display: none; /* Hide this since it's already shown in the dashboard */
}

.schedule-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
  width: 100%;
}

.calendar-container {
  width: 100%;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
  border: 2px solid #fecaca;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.calendar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.calendar-container:hover {
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.12);
  transform: translateY(-2px);
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #fecaca;
}

.calendar-header i {
  font-size: 1.3rem;
  color: #dc2626;
}

.calendar-header span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4b5563;
}

.time-schedule-container {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
  border: 2px solid #fecaca;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.time-schedule-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.selected-date {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #fecaca;
  position: relative;
  background-color: #fff5f5;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.selected-date h3 {
  color: #dc2626;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.selected-date h3 i {
  font-size: 1rem;
  color: #dc2626;
}

.schedule-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.availability-toggle {
  margin-bottom: 16px;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.toggle-container input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 40px;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.toggle-container input[type="checkbox"]:checked {
  background-color: #dc2626;
}

.toggle-container input[type="checkbox"]::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  background-color: white;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.toggle-container input[type="checkbox"]:checked::before {
  left: calc(100% - 18px);
}

.toggle-label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.9rem;
}

.time-inputs {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  background-color: #fff5f5;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.time-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-field label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-field label i {
  color: #dc2626;
  font-size: 0.9rem;
}

.time-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s;
  color: #1f2937;
  background-color: white;
  outline: none;
}

.time-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.schedule-summary {
  margin-top: 20px;
  border-top: 1px solid #fecaca;
  padding-top: 16px;
}

.schedule-summary h4 {
  color: #dc2626;
  font-size: 1rem;
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-summary h4::before {
  content: "\f073";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 0.9rem;
}

.scheduled-days {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
  padding-left: 2px;
}

.scheduled-days::-webkit-scrollbar {
  width: 6px;
}

.scheduled-days::-webkit-scrollbar-track {
  background: #fef2f2;
  border-radius: 10px;
}

.scheduled-days::-webkit-scrollbar-thumb {
  background: #fecaca;
  border-radius: 10px;
}

.scheduled-days::-webkit-scrollbar-thumb:hover {
  background: #ef4444;
}

.scheduled-day-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff5f5;
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.scheduled-day-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 4px;
  background-color: #dc2626;
}

.day-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 6px;
}

.day-date {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
}

.day-hours {
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.day-hours::before {
  content: "\f017";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 0.8rem;
  color: #dc2626;
}

.remove-day-btn {
  background-color: #fecaca;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  padding: 0;
  font-size: 0.75rem;
  margin-right: 2px;
}

.remove-day-btn:hover {
  background-color: #dc2626;
  color: white;
}

.remove-day-btn:focus {
  outline: none;
}

.no-days {
  color: #6b7280;
  font-style: italic;
  text-align: center;
  padding: 24px;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px dashed #fecaca;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-days::before {
  content: "\f271";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 1.8rem;
  color: #fecaca;
}

.save-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 16px;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.save-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: all 0.6s;
}

.save-button:hover:not(:disabled):before {
  left: 100%;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.15);
}

.save-button:disabled {
  opacity: 0.6;
  background: #cbd5e1;
  cursor: not-allowed;
}

.save-button i {
  font-size: 1.1rem;
}

.clear-all-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.clear-all-button {
  padding: 8px 14px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-all-button:hover {
  background-color: #b91c1c;
}

.clear-all-button i {
  font-size: 0.85rem;
}

@media (min-width: 1200px) {
  .schedule-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .calendar-container {
    flex: 1;
    max-width: 50%;
  }
  
  .time-schedule-container {
    flex: 1;
    max-width: 50%;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .schedule-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .calendar-container {
    flex: 1;
  }
  
  .time-schedule-container {
    flex: 1;
  }
}

@media (max-width: 767px) {
  .time-inputs {
    flex-direction: column;
  }
  
  .calendar-container {
    margin-bottom: 20px;
  }
  
  .scheduled-day-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .remove-day-btn {
    align-self: flex-end;
    margin-top: -30px;
  }
  
  .selected-date h3 {
    font-size: 1rem;
  }
  
  .schedule-controls {
    padding: 15px;
  }
  
  .time-input {
    padding: 10px;
  }
  
  .toggle-label {
    font-size: 0.9rem;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .save-button {
    padding: 14px 10px;
    font-size: 0.9rem;
  }
}

/* Custom styles for v-calendar to match the design */
:deep(.vc-container) {
  --vc-accent-600: #dc2626 !important;
  --vc-accent-500: #ef4444 !important;
  --vc-accent-400: #f87171 !important;
  border: none !important;
  box-shadow: none !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  width: 100% !important;
  max-width: 100% !important;
  font-size: 1rem !important;
}

:deep(.vc-pane-container) {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.vc-pane) {
  flex-grow: 1 !important;
  width: 100% !important;
  padding: 0 8px !important;
}

:deep(.vc-weeks) {
  padding: 10px 0 !important;
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.vc-week) {
  width: 100% !important;
  display: flex !important;
  justify-content: space-around !important;
}

:deep(.vc-day) {
  transition: all 0.2s ease !important;
  position: relative !important;
  height: 42px !important;
  padding: 0 !important;
  z-index: 1 !important;
  width: calc(100% / 7) !important;
  max-width: 60px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

:deep(.vc-day:hover) {
  transform: scale(1.05) !important;
  z-index: 2 !important;
  background: transparent !important;
}

:deep(.vc-weekdays) {
  width: 100% !important;
  display: flex !important;
  justify-content: space-around !important;
}

:deep(.vc-weekday) {
  color: #6b7280 !important;
  font-weight: 600 !important;
  padding: 8px 0 !important;
  width: calc(100% / 7) !important;
  max-width: 60px !important;
  text-align: center !important;
}

:deep(.vc-day-content) {
  font-weight: 600 !important;
  height: 36px !important;
  width: 36px !important;
  margin: 3px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
}

:deep(.vc-day-content:hover) {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
  border-radius: 50% !important;
}

:deep(.vc-highlight) {
  width: 36px !important;
  height: 36px !important;
  margin: 3px !important;
  border-radius: 50% !important;
}

:deep(.vc-highlight-content-solid) {
  width: 36px !important;
  height: 36px !important;
  background-color: #dc2626 !important;
  border-radius: 50% !important;
}

:deep(.vc-highlight-bg) {
  background-color: transparent !important;
}

:deep(.vc-day.is-today) {
  font-weight: 700 !important;
}

:deep(.vc-day.is-today .vc-day-content) {
  color: #dc2626 !important;
  border: 2px solid #dc2626 !important;
  background-color: transparent !important;
}

:deep(.vc-day.is-not-in-month) {
  opacity: 0.3 !important;
}

:deep(.vc-day.is-disabled) {
  opacity: 0.4 !important;
}

:deep(.vc-header) {
  padding: 14px 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.vc-title) {
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  color: #1f2937 !important;
  text-align: center !important;
}

:deep(.vc-header .vc-title) {
  flex-grow: 1 !important;
  text-align: center !important;
}

:deep(.vc-arrows-container) {
  width: 100% !important;
  justify-content: space-between !important;
  padding: 0 10px !important;
}

:deep(.vc-nav-title) {
  color: #dc2626 !important;
  font-weight: 600 !important;
}

:deep(.vc-nav-arrow) {
  color: #dc2626 !important;
  transition: all 0.2s ease !important;
}

:deep(.vc-nav-arrow:hover) {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

:deep(.vc-nav-item:hover) {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

:deep(.vc-nav-item.is-active) {
  background-color: #dc2626 !important;
  color: white !important;
}

:deep(.vc-dot) {
  background-color: #dc2626 !important;
  width: 6px !important;
  height: 6px !important;
  margin: 0 1px !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
}

:deep(.vc-svg-icon) {
  fill: currentColor !important;
}

:deep(.vc-nav-popover-container) {
  border: 2px solid #fecaca !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

:deep(.vc-nav-popover) {
  border-radius: 12px !important;
}

.info-alert {
  background-color: #f8f0ff;
  border-left: 4px solid #7c4dff;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-alert i {
  color: #7c4dff;
  font-size: 20px;
  margin-top: 2px;
}

.info-alert strong {
  color: #7c4dff;
  font-weight: 600;
}

.info-alert div {
  flex: 1;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.5;
}

.weekday-label {
  font-weight: 700;
  color: #7c4dff;
  margin-left: 6px;
}

.mt-2 {
  margin-top: 8px;
}
</style> 