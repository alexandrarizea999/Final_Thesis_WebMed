<template>
  <div class="dispecer-dashboard">
    <div class="dashboard-header">
      <h1>Dispatcher Dashboard</h1>
      <p class="subtitle">Manage appointments, medical records, and tests</p>
    </div>
    <div class="dashboard-tabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'appointments' }" 
        @click="activeTab = 'appointments'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" />
        </svg>
        Appointments
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'medical-records' }" 
        @click="activeTab = 'medical-records'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <path d="M11.625 16.5a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
          <path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 001.06-1.06l-1.047-1.048A3.375 3.375 0 1011.625 18z" clip-rule="evenodd" />
          <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
        </svg>
        Medical Records
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'tests' }" 
        @click="activeTab = 'tests'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <path fill-rule="evenodd" d="M2.25 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
        </svg>
        Tests
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'doctors' }" 
        @click="activeTab = 'doctors'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
        </svg>
        Doctors
      </div>
    </div>
    <div v-if="activeTab === 'appointments'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2>All Appointments</h2>
          <span class="count-badge" v-if="!loading.appointments">{{ appointments.length }} appointments</span>
        </div>
        <div class="card-body">
          <div class="filters">
            <div class="form-group">
              <label for="date-filter">Filter by Date:</label>
              <input 
                type="date" 
                id="date-filter" 
                v-model="filters.appointmentDate" 
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="status-filter">Filter by Status:</label>
              <select id="status-filter" v-model="filters.appointmentStatus" class="form-control">
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="form-group search-group">
              <label for="appointment-search">Search:</label>
              <div class="search-input-container">
                <input 
                  type="text" 
                  id="appointment-search" 
                  v-model="filters.appointmentSearch" 
                  class="form-control" 
                  placeholder="Search patient or doctor..."
                >
                <span class="search-icon">🔍</span>
              </div>
            </div>
            <div class="form-group button-group">
              <button class="clear-filter-btn" @click="clearAppointmentFilters">Clear Filters</button>
            </div>
          </div>
          <div v-if="loading.appointments" class="loader-container">
            <div class="loader"></div>
            <p>Loading appointments data...</p>
          </div>
          <div v-else-if="filteredAppointments.length === 0" class="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" />
            </svg>
            <p>No appointments found matching your criteria.</p>
            <button class="clear-filter-btn" @click="clearAppointmentFilters">Clear All Filters</button>
          </div>
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in filteredAppointments" :key="appointment.id">
                  <td>{{ appointment.id }}</td>
                  <td>{{ appointment.patient_name }}</td>
                  <td>{{ appointment.doctor_name }}</td>
                  <td>{{ formatDateTime(appointment.appointment_date) }}</td>
                  <td>
                    <span 
                      class="status-badge" 
                      :class="{
                        'status-scheduled': appointment.status === 'scheduled',
                        'status-completed': appointment.status === 'completed',
                        'status-cancelled': appointment.status === 'cancelled'
                      }"
                    >
                      {{ appointment.status }}
                    </span>
                  </td>
                  <td class="truncate">{{ appointment.notes || 'No notes' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'medical-records'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2>All Medical Records</h2>
          <span class="count-badge" v-if="!loading.medicalRecords">{{ medicalRecords.length }} records</span>
        </div>
        <div class="card-body">
          <div class="filters">
            <div class="form-group">
              <label for="record-date">Filter by Date:</label>
              <input 
                type="date" 
                id="record-date" 
                v-model="filters.recordDate" 
                class="form-control"
              >
            </div>
            <div class="form-group search-group">
              <label for="record-search">Search:</label>
              <div class="search-input-container">
                <input 
                  type="text" 
                  id="record-search" 
                  v-model="filters.recordSearch" 
                  class="form-control" 
                  placeholder="Search patient or diagnosis..."
                >
                <span class="search-icon">🔍</span>
              </div>
            </div>
            <div class="form-group button-group">
              <button class="clear-filter-btn" @click="clearRecordFilters">Clear Filters</button>
            </div>
          </div>
          
          <div v-if="loading.medicalRecords" class="loader-container">
            <div class="loader"></div>
            <p>Loading medical records data...</p>
          </div>
          
          <div v-else-if="filteredMedicalRecords.length === 0" class="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
              <path d="M3 18.4v-2.796a4.3 4.3 0 00.713.31A26.226 26.226 0 0012 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 01-6.477-.427C4.047 21.128 3 19.852 3 18.4z" />
            </svg>
            <p>No medical records found matching your criteria.</p>
            <button class="clear-filter-btn" @click="clearRecordFilters">Clear All Filters</button>
          </div>
          
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in filteredMedicalRecords" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.patient_name }}</td>
                  <td>{{ record.doctor_name }}</td>
                  <td>{{ formatDate(record.record_date) }}</td>
                  <td>{{ record.diagnosis }}</td>
                  <td class="truncate">{{ record.notes || 'No notes' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'tests'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2>All Medical Tests</h2>
          <span class="count-badge" v-if="!loading.tests">{{ tests.length }} tests</span>
        </div>
        <div class="card-body">
          <div class="filters">
            <div class="form-group">
              <label for="test-date">Filter by Date:</label>
              <input 
                type="date" 
                id="test-date" 
                v-model="filters.testDate" 
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="test-status">Filter by Status:</label>
              <select id="test-status" v-model="filters.testStatus" class="form-control">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="form-group search-group">
              <label for="test-search">Search:</label>
              <div class="search-input-container">
                <input 
                  type="text" 
                  id="test-search" 
                  v-model="filters.testSearch" 
                  class="form-control" 
                  placeholder="Search patient or test type..."
                >
                <span class="search-icon">🔍</span>
              </div>
            </div>
            <div class="form-group button-group">
              <button class="clear-filter-btn" @click="clearTestFilters">Clear Filters</button>
            </div>
          </div>
          
          <div v-if="loading.tests" class="loader-container">
            <div class="loader"></div>
            <p>Loading medical tests data...</p>
          </div>
          
          <div v-else-if="filteredTests.length === 0" class="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
            </svg>
            <p>No tests found matching your criteria.</p>
            <button class="clear-filter-btn" @click="clearTestFilters">Clear All Filters</button>
          </div>
          
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Test Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Results</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="test in filteredTests" :key="test.id">
                  <td>{{ test.id }}</td>
                  <td>{{ test.patient_name }}</td>
                  <td>{{ test.test_type }}</td>
                  <td>{{ formatDate(test.test_date) }}</td>
                  <td>
                    <span 
                      class="status-badge" 
                      :class="{
                        'status-pending': test.status === 'pending',
                        'status-completed': test.status === 'completed',
                        'status-cancelled': test.status === 'cancelled'
                      }"
                    >
                      {{ test.status }}
                    </span>
                  </td>
                  <td class="truncate">{{ test.results || 'No results yet' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'doctors'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2>All Doctors</h2>
          <span class="count-badge" v-if="!loading.doctors">{{ doctors.length }} doctors</span>
        </div>
        <div class="card-body">
          <div class="filters">
            <div class="form-group search-group">
              <label for="doctor-search">Search:</label>
              <div class="search-input-container">
                <input 
                  type="text" 
                  id="doctor-search" 
                  v-model="filters.doctorSearch" 
                  class="form-control" 
                  placeholder="Search by name, email, or location..."
                >
                <span class="search-icon">🔍</span>
              </div>
            </div>
            <div class="form-group">
              <label for="day-filter">Filter by Day:</label>
              <select id="day-filter" v-model="filters.availabilityDay" class="form-control">
                <option value="">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div class="form-group button-group">
              <button class="clear-filter-btn" @click="clearDoctorFilters">Clear Filters</button>
            </div>
          </div>
          
          <div v-if="loading.doctors" class="loader-container">
            <div class="loader"></div>
            <p>Loading doctors data...</p>
          </div>
          
          <div v-else-if="filteredDoctors.length === 0" class="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
            </svg>
            <p>No doctors found matching your criteria.</p>
            <button class="clear-filter-btn" @click="clearDoctorFilters">Clear All Filters</button>
          </div>
          
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doctor in filteredDoctors" :key="doctor.id">
                  <td>{{ doctor.first_name }} {{ doctor.last_name }}</td>
                  <td>{{ doctor.email }}</td>
                  <td>{{ doctor.phone_number || 'N/A' }}</td>
                  <td>{{ doctor.city ? `${doctor.city}, ${doctor.county || 'N/A'}` : 'N/A' }}</td>
                  <td>
                    <div v-if="doctor.availability && doctor.availability.length > 0">
                      <ul class="availability-list">
                        <li v-for="slot in doctor.availability" :key="slot.id">
                          {{ slot.day_of_week }}: {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
                        </li>
                      </ul>
                    </div>
                    <div v-else>No availability set</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'DispecerDashboard',
  data() {
    return {
      activeTab: 'appointments',
      appointments: [],
      medicalRecords: [],
      tests: [],
      doctors: [],
      loading: {
        appointments: true,
        medicalRecords: true,
        tests: true,
        doctors: true
      },
      error: null,
      filters: {
        appointmentDate: '',
        appointmentStatus: '',
        appointmentSearch: '',
        recordDate: '',
        recordSearch: '',
        testDate: '',
        testStatus: '',
        testSearch: '',
        doctorSearch: '',
        availabilityDay: ''
      }
    };
  },
  computed: {
    filteredAppointments() {
      return this.appointments.filter(appointment => {
        if (this.filters.appointmentDate) {
          const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
          if (appointmentDate !== this.filters.appointmentDate) {
            return false;
          }
        }
        if (this.filters.appointmentStatus && appointment.status !== this.filters.appointmentStatus) {
          return false;
        }
        if (this.filters.appointmentSearch) {
          const searchLower = this.filters.appointmentSearch.toLowerCase();
          const patientName = appointment.patient_name.toLowerCase();
          const doctorName = appointment.doctor_name.toLowerCase();
          
          return patientName.includes(searchLower) || doctorName.includes(searchLower);
        }
        
        return true;
      });
    },
    filteredMedicalRecords() {
      return this.medicalRecords.filter(record => {
        if (this.filters.recordDate) {
          const recordDate = new Date(record.record_date).toISOString().split('T')[0];
          if (recordDate !== this.filters.recordDate) {
            return false;
          }
        }
        if (this.filters.recordSearch) {
          const searchLower = this.filters.recordSearch.toLowerCase();
          const patientName = record.patient_name.toLowerCase();
          const diagnosis = (record.diagnosis || '').toLowerCase();
          
          return patientName.includes(searchLower) || diagnosis.includes(searchLower);
        }
        return true;
      });
    },
    filteredTests() {
      return this.tests.filter(test => {
        if (this.filters.testDate) {
          const testDate = new Date(test.test_date).toISOString().split('T')[0];
          if (testDate !== this.filters.testDate) {
            return false;
          }
        }
        if (this.filters.testStatus && test.status !== this.filters.testStatus) {
          return false;
        }
        if (this.filters.testSearch) {
          const searchLower = this.filters.testSearch.toLowerCase();
          const patientName = test.patient_name.toLowerCase();
          const testType = test.test_type.toLowerCase();
          
          return patientName.includes(searchLower) || testType.includes(searchLower);
        }
        return true;
      });
    },
    filteredDoctors() {
      return this.doctors.filter(doctor => {
        if (this.filters.doctorSearch) {
          const searchLower = this.filters.doctorSearch.toLowerCase();
          const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
          const email = doctor.email.toLowerCase();
          const location = doctor.city ? `${doctor.city} ${doctor.county || ''}`.toLowerCase() : '';
          if (!fullName.includes(searchLower) && 
              !email.includes(searchLower) && 
              !location.includes(searchLower)) {
            return false;
          }
        }
        if (this.filters.availabilityDay && doctor.availability && doctor.availability.length > 0) {
          const hasAvailabilityOnDay = doctor.availability.some(
            slot => slot.day_of_week === this.filters.availabilityDay && slot.is_available
          );
          if (!hasAvailabilityOnDay) {
            return false;
          }
        }
        return true;
      });
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('ro-RO');
    },
    
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'N/A';
      
      const date = new Date(dateTimeString);
      return `${date.toLocaleDateString('ro-RO')} ${date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
    },
    
    formatTime(timeString) {
      if (!timeString) return 'N/A';
      return timeString.substring(0, 5);
    },
    
    clearAppointmentFilters() {
      this.filters.appointmentDate = '';
      this.filters.appointmentStatus = '';
      this.filters.appointmentSearch = '';
    },
    
    clearRecordFilters() {
      this.filters.recordDate = '';
      this.filters.recordSearch = '';
    },
    
    clearTestFilters() {
      this.filters.testDate = '';
      this.filters.testStatus = '';
      this.filters.testSearch = '';
    },
    
    clearDoctorFilters() {
      this.filters.doctorSearch = '';
      this.filters.availabilityDay = '';
    },
    
    async fetchAppointments() {
      this.loading.appointments = true;
      try {
        const response = await api.get('/api/appointments/all');
        this.appointments = response.data;
      } catch (error) {
        console.error('Error fetching appointments:', error);
        this.error = 'Failed to load appointments data';
      } finally {
        this.loading.appointments = false;
      }
    },
    
    async fetchMedicalRecords() {
      this.loading.medicalRecords = true;
      try {
        const response = await api.get('/api/medical-records/all');
        this.medicalRecords = response.data;
      } catch (error) {
        console.error('Error fetching medical records:', error);
        this.error = 'Failed to load medical records data';
      } finally {
        this.loading.medicalRecords = false;
      }
    },
    
    async fetchMedicalTests() {
      this.loading.tests = true;
      try {
        const response = await api.get('/api/medical-tests/all');
        this.tests = response.data;
      } catch (error) {
        console.error('Error fetching medical tests:', error);
        this.error = 'Failed to load medical tests data';
      } finally {
        this.loading.tests = false;
      }
    },
    
    async fetchDoctors() {
      this.loading.doctors = true;
      try {
        const response = await api.get('/api/users/doctors/detailed');
        this.doctors = response.data;
      } catch (error) {
        console.error('Error fetching doctors:', error);
        this.error = 'Failed to load doctors data';
      } finally {
        this.loading.doctors = false;
      }
    }
  },
  mounted() {
    this.fetchAppointments();
    this.fetchMedicalRecords();
    this.fetchMedicalTests();
    this.fetchDoctors();
  }
};
</script>

<style scoped>
.dispecer-dashboard {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f9fafb;
  min-height: calc(100vh - 60px);
}

.dashboard-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  position: relative;
  display: inline-block;
}

.dashboard-header h1::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin-top: 4px;
}

.dashboard-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #eaeaea;
  margin-top: 10px;
  gap: 10px;
}

.tab {
  padding: 15px 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05rem;
  color: #6b7280;
  transition: all 0.3s ease;
  position: relative;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab:hover {
  color: #dc2626;
  background-color: rgba(220, 38, 38, 0.05);
}

.tab.active {
  color: #dc2626;
  border-bottom: 2px solid #dc2626;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 30px;
  background-color: white;
  overflow: hidden;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.card-header {
  background-color: white;
  padding: 24px 25px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  position: relative;
  padding-left: 12px;
}

.card-header h2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 4px;
  background-color: #dc2626;
  border-radius: 4px;
}

.count-badge {
  background-color: #f1f5fd;
  color: #2563eb;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.count-badge::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #2563eb;
}

.card-body {
  padding: 25px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 25px;
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
}

.filters::before {
  content: 'FILTERS';
  position: absolute;
  top: -10px;
  left: 15px;
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.form-group {
  flex: 1;
  min-width: 180px;
}

.search-group {
  flex: 2;
  min-width: 250px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  font-size: 0.9rem;
}

.search-input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: white;
}

.form-control:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
  outline: none;
}

.button-group {
  display: flex;
  align-items: flex-end;
  margin-bottom: 0;
  min-width: 150px;
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  gap: 8px;
  height: 42px;
}

.clear-filter-btn::before {
  content: '↻';
  font-size: 1rem;
}

.clear-filter-btn:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.loader-container {
  text-align: center;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loader {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(220, 38, 38, 0.1);
  border-radius: 50%;
  border-top-color: #dc2626;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader-container p {
  color: #6b7280;
  font-size: 1.1rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.no-results {
  text-align: center;
  padding: 50px 40px;
  color: #6b7280;
  font-size: 1.1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.no-results svg {
  width: 70px;
  height: 70px;
  color: #d1d5db;
  margin-bottom: 10px;
}

.table-responsive {
  border-radius: 8px;
  overflow: auto;
  border: 1px solid #f0f0f0;
  background-color: white;
  max-height: 600px;
  position: relative;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.95rem;
  table-layout: fixed;
}

.data-table th {
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
  position: sticky;
  top: 0;
  border-top: 1px solid #f0f0f0;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.data-table th:first-child {
  border-top-left-radius: 8px;
  border-left: 1px solid #f0f0f0;
}

.data-table th:last-child {
  border-top-right-radius: 8px;
  border-right: 1px solid #f0f0f0;
}

.data-table td:first-child {
  border-left: 1px solid #f0f0f0;
}

.data-table td:last-child {
  border-right: 1px solid #f0f0f0;
}

.data-table tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.data-table tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

.data-table tr:last-child td {
  border-bottom: 1px solid #f0f0f0;
}

.data-table tr {
  transition: background-color 0.15s ease;
}

.data-table tr:hover {
  background-color: #f1f5f9;
}

.truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-scheduled, .status-pending {
  background-color: #e0f2fe;
  color: #0369a1;
}

.status-scheduled::before, .status-pending::before {
  background-color: #0ea5e9;
}

.status-completed {
  background-color: #dcfce7;
  color: #166534;
}

.status-completed::before {
  background-color: #22c55e;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-cancelled::before {
  background-color: #ef4444;
}

/* Column widths */
.data-table th:nth-child(1), 
.data-table td:nth-child(1) {
  width: 60px;
}

.data-table th:nth-child(2), 
.data-table td:nth-child(2) {
  width: 20%;
}

.data-table th:nth-child(3), 
.data-table td:nth-child(3) {
  width: 20%;
}

.data-table th:nth-child(4), 
.data-table td:nth-child(4) {
  width: 15%;
}

.data-table th:nth-child(5), 
.data-table td:nth-child(5) {
  width: 110px;
}

@media (max-width: 992px) {
  .dispecer-dashboard {
    padding: 20px;
  }
  
  .filters {
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group, .search-group {
    min-width: 100%;
  }
  
  .button-group {
    width: 100%;
    justify-content: center;
  }
  
  .clear-filter-btn {
    width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .count-badge {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .dispecer-dashboard {
    padding: 15px;
  }
  
  .dashboard-header h1 {
    font-size: 1.8rem;
  }
  
  .dashboard-tabs {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .tab {
    padding: 10px 15px;
    flex-grow: 1;
    text-align: center;
    font-size: 0.95rem;
  }
  
  .data-table {
    font-size: 0.85rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 10px;
  }
  
  .card-header h2 {
    font-size: 1.3rem;
  }
  
  .truncate {
    max-width: 150px;
  }
  
  /* Mobile-specific table adjustments */
  .table-responsive {
    max-height: 400px;
  }
  
  /* Stack table cells on very small screens */
  @media (max-width: 480px) {
    .data-table {
      table-layout: auto;
    }
    
    .data-table th, 
    .data-table td {
      white-space: nowrap;
    }
    
    /* Force horizontal scrolling */
    .table-responsive {
      overflow-x: auto;
    }
    
    /* Column width reset for mobile scrolling */
    .data-table th:nth-child(n), 
    .data-table td:nth-child(n) {
      width: auto;
    }
  }
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 