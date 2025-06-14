<template>
  <div class="login">
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="loginError" class="error-message">{{ loginError }}</div>
        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="formData.email" required>
        </div>

        <div class="form-group">
          <label>Password:</label>
          <input type="password" v-model="formData.password" required>
        </div>

        <button type="submit">
          <span>Login</span>
        </button>
        
        <p class="register-link">
          Don't have an account? 
          <router-link to="/register">Register here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axiosInstance from '../services/axios-config'

export default {
  name: 'LoginView',
  data() {
    return {
      formData: {
        email: '',
        password: ''
      },
      loginError: null
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await axiosInstance.post('/api/login', this.formData);
        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.role === 'admin') {
          this.$router.push('/admin-dashboard');
        } else if (response.data.user.role === 'doctor') {
          this.$router.push('/doctor-dashboard');
        } else if (response.data.user.role === 'dispecer') {
          this.$router.push('/dispecer-dashboard');
        } else {
          this.$router.push('/profile-dashboard');
        }
      } catch (error) {
        console.error('Login failed:', error);
        this.loginError = error.response?.data?.message || 'Login failed. Please try again.';
      }
    }
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
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

.login-container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.login-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.15);
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

.login-form {
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
  padding: 12px;
  border: 2px solid #ffeeee;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
}

input:focus {
  outline: none;
  border-color: #cc0000;
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

button {
  background: linear-gradient(135deg, #cc0000, #990000);
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.2);
  margin-top: 10px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.3);
  background: linear-gradient(135deg, #ff0000, #cc0000);
}

button:active {
  transform: translateY(1px);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #660000;
}

.register-link a {
  color: #cc0000;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
}

.register-link a:after {
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

.register-link a:hover:after {
  transform: scaleX(1);
}

.error-message {
  background-color: #2c1a1a;
  color: #ffcccc;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #cc0000;
  text-align: center;
  font-size: 0.9em;
  animation: fadeIn 0.3s ease-out;
}
</style> 