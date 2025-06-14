<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <p class="subtitle">Manage users and system settings</p>
    </div>
    <div class="admin-panel">
      <div class="card">
        <div class="card-header">
          <h2>User Management</h2>
          <span class="user-count" v-if="!loading">{{ filteredUsers.length }} users</span>
        </div>
        <div class="card-body">
          <div class="filters">
            <div class="form-group">
              <label for="role-filter">Filter by Role:</label>
              <select id="role-filter" v-model="roleFilter" class="form-control">
                <option value="">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div class="form-group search-group">
              <label for="search">Search:</label>
              <div class="search-input-container">
                <input 
                  type="text" 
                  id="search" 
                  v-model="searchTerm" 
                  class="form-control" 
                  placeholder="Search name or email..."
                >
                <span class="search-icon">🔍</span>
              </div>
            </div>
          </div>
          <div v-if="loading" class="loader-container">
            <div class="loader"></div>
            <p>Loading users...</p>
          </div>
          <div v-else-if="error" class="alert alert-danger">
            {{ error }}
          </div>
          <div v-else-if="filteredUsers.length === 0" class="no-results">
            <p>No users found matching your criteria.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td class="user-name">{{ user.first_name }} {{ user.last_name }}</td>
                  <td class="user-email">{{ user.email }}</td>
                  <td>
                    <span 
                      class="badge" 
                      :class="{
                        'badge-patient': user.role === 'patient',
                        'badge-doctor': user.role === 'doctor',
                        'badge-admin': user.role === 'admin'
                      }"
                    >
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ user.phone_number || 'N/A' }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
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
  name: 'AdminDashboard',
  data() {
    return {
      users: [],
      loading: true,
      error: null,
      roleFilter: '',
      searchTerm: ''
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        if (this.roleFilter && user.role !== this.roleFilter) {
          return false;
        }
        if (this.searchTerm) {
          const searchLower = this.searchTerm.toLowerCase();
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          const email = user.email.toLowerCase();
          
          return fullName.includes(searchLower) || email.includes(searchLower);
        }
        
        return true;
      });
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/api/users/all');
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.response?.status === 403) {
          this.error = 'You do not have permission to access this page.';
        } else {
          this.error = 'Failed to load users. Please try again later.';
        }
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f9f9f9;
  min-height: calc(100vh - 60px);
}

.dashboard-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 20px;
}

.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-top: 0;
}

.admin-panel {
  margin-top: 20px;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  background-color: white;
  overflow: hidden;
  border: none;
}

.card-header {
  background-color: white;
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.user-count {
  background-color: #f1f5fd;
  color: #2563eb;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-body {
  padding: 25px;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  flex: 1;
}

.search-group {
  flex: 2;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  outline: none;
}

.search-input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  pointer-events: none;
}

.loader-container {
  text-align: center;
  padding: 40px;
}

.loader {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #dc2626;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
  background-color: #f9fafb;
  border-radius: 8px;
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.user-table th {
  font-weight: 600;
  color: #444;
  background-color: #f9fafb;
  position: sticky;
  top: 0;
}

.user-table tr:hover {
  background-color: #f9fafb;
}

.user-table tr:last-child td {
  border-bottom: none;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-email {
  color: #4b5563;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-patient {
  background-color: #e0f2fe;
  color: #0369a1;
}

.badge-doctor {
  background-color: #dcfce7;
  color: #166534;
}

.badge-admin {
  background-color: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 992px) {
  .admin-dashboard {
    padding: 20px;
  }
  
  .filters {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .user-table {
    font-size: 0.9rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-count {
    margin-top: 10px;
  }
  
  .badge {
    padding: 4px 10px;
  }
}
</style> 