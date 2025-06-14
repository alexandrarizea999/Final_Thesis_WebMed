<template>
  <div class="register">
    <div class="register-container">
      <h2>Register</h2>
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="formData.email" required>
        </div>

        <div class="form-group">
          <label>Password:</label>
          <input type="password" v-model="formData.password" required>
        </div>

        <div class="form-group">
          <label>First Name:</label>
          <input type="text" v-model="formData.firstName" required>
        </div>

        <div class="form-group">
          <label>Last Name:</label>
          <input type="text" v-model="formData.lastName" required>
        </div>

        <div class="form-group">
          <label>Phone Number:</label>
          <input type="tel" v-model="formData.phoneNumber">
        </div>

        <div class="form-group">
          <label>Date of Birth:</label>
          <input type="date" v-model="formData.dateOfBirth">
        </div>

        <div class="form-group">
          <label>Gender:</label>
          <select v-model="formData.gender">
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Address:</label>
          <textarea v-model="formData.address"></textarea>
        </div>

        <div class="form-group">
          <label>City:</label>
          <input type="text" v-model="formData.city">
        </div>

        <div class="form-group">
          <label>County:</label>
          <input type="text" v-model="formData.county">
        </div>

        <div class="form-group">
          <label>Role:</label>
          <select v-model="formData.role" required>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        <button type="submit">
          <span>Register</span>
        </button>
        
        <p class="login-link">
          Already have an account? 
          <router-link to="/login">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RegisterView',
  data() {
    return {
      formData: {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        county: '',
        role: 'patient'
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await axios.post('http://localhost:5000/api/register', {
          user: {
            email: this.formData.email,
            password: this.formData.password,
            role: this.formData.role
          },
          profile: {
            first_name: this.formData.firstName,
            last_name: this.formData.lastName,
            phone_number: this.formData.phoneNumber,
            date_of_birth: this.formData.dateOfBirth,
            gender: this.formData.gender,
            address: this.formData.address,
            city: this.formData.city,
            county: this.formData.county
          }
        })
        
        console.log('Registration successful:', response.data)
        alert('Registration successful! Please log in with your new credentials.')
        this.$router.push('/login')
      } catch (error) {
        console.error('Registration failed:', error)
        alert(error.response?.data?.message || 'Registration failed. Please try again.')
      }
    }
  }
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  animation: fadeIn 0.5s ease-out;
  padding: 40px 20px;
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

.register-container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(204, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  transition: all 0.3s ease;
}

.register-container:hover {
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

.register-form {
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

input, select, textarea {
  padding: 12px;
  border: 2px solid #ffeeee;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #ffffff, #ffeeee);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #cc0000;
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

textarea {
  height: 100px;
  resize: vertical;
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

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #660000;
}

.login-link a {
  color: #cc0000;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
}

.login-link a:after {
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

.login-link a:hover:after {
  transform: scaleX(1);
}
</style> 