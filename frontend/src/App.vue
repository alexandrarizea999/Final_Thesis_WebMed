<template>
  <div id="app">
    <nav class="navbar">
      <div class="brand">
        <router-link to="/">WebMed</router-link>
      </div>
      <div class="nav-links">
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link btn-register">Register</router-link>
        </template>
        <template v-else>
          <template v-if="isAdmin">
            <router-link to="/admin-dashboard" class="nav-link">Admin Dashboard</router-link>
          </template>
          <template v-else-if="isDoctor">
            <router-link to="/doctor-dashboard" class="nav-link">Doctor Dashboard</router-link>
          </template>
          <template v-else-if="isDispecer">
            <router-link to="/dispecer-dashboard" class="nav-link">Dispatcher Dashboard</router-link>
          </template>
          <template v-else>
            <router-link to="/profile-dashboard" class="nav-link">Dashboard</router-link>
          </template>
          <a href="#" @click.prevent="logout" class="nav-link">Logout</a>
        </template>
      </div>
    </nav>
    <router-view/>
  </div>
</template>
<script>

export default {
  data() {
    return {
      isLoggedIn: false,
      user: null
    }
  },
  computed: {
    isAdmin() {
      return this.user && this.user.role === 'admin';
    },
    isDoctor() {
      return this.user && this.user.role === 'doctor';
    },
    isDispecer() {
      return this.user && this.user.role === 'dispecer';
    }
  },
  created() {
    this.checkLoginStatus();
    window.addEventListener('storage', this.checkLoginStatus);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkLoginStatus);
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      this.user = userData ? JSON.parse(userData) : null;
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isLoggedIn = false;
      this.user = null;
      this.$router.push('/');
    }
  },
  watch: {
    '$route'() {
      this.checkLoginStatus();
    }
  }
}
</script>
<style>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(220, 38, 38, 0.08);
}
.brand a {
  font-size: 1.8rem;
  font-weight: bold;
  color: #dc2626;
  text-decoration: none;
  transition: color 0.3s ease;
}
.brand a:hover {
  color: #b91c1c;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.nav-link {
  color: #dc2626;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}
.nav-link:hover {
  color: #b91c1c;
}
.btn-register {
  background-color: #dc2626;
  color: white !important;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}
.btn-register:hover {
  background-color: #b91c1c;
  color: white !important;
}
.router-view {
  flex: 1;
}
#app > div:not(.navbar) {
  flex: 1;
}
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }
  
  .nav-links {
    margin-top: 1rem;
  }
}
</style> 