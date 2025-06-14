const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./config/database');

// JWT secret key (should match the one in your server.js)
const JWT_SECRET = 'your-secret-key';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Dispatcher credentials
const dispatcherCredentials = {
  email: 'dispecer@test.com',
  password: 'password123'
};

// Function to check if server is running
async function checkServerStatus() {
  try {
    console.log('Checking if the server is running...');
    await axios.get(`${API_URL.split('/api')[0]}`);
    console.log('Server is running!');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\nERROR: Server is not running!');
      console.log('Please start the server with:');
      console.log('  npm start');
      return false;
    }
    
    // If we get a response, even an error, the server is running
    console.log('Server is running (received response)');
    return true;
  }
}

// Function to login and get token
async function login(credentials) {
  try {
    console.log('Attempting to login with:', credentials.email);
    const response = await axios.post(`${API_URL}/login`, credentials);
    console.log('Login successful!');
    return response.data.token;
  } catch (error) {
    if (error.response) {
      console.error('Login error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from server. Is the server running?');
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
}

// Function to get doctors list (for dispatcher dashboard)
async function getDoctorsList(token) {
  try {
    console.log('Authorization token:', token);
    const response = await axios.get(`${API_URL}/users/doctors/detailed`, {
      headers: {
        'x-auth-token': token
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error fetching doctors:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
}

// Main function to test dispatcher endpoints
async function testDispatcherEndpoints() {
  try {
    // First check if server is running
    const isServerRunning = await checkServerStatus();
    if (!isServerRunning) {
      return;
    }
    
    console.log('\nLogging in as dispatcher...');
    const token = await login(dispatcherCredentials);
    
    console.log('\nFetching doctors list for dispatcher dashboard...');
    const doctors = await getDoctorsList(token);
    
    console.log('\n=== DOCTORS LIST ===');
    doctors.forEach(doctor => {
      console.log(`\nID: ${doctor.id}`);
      console.log(`Name: ${doctor.first_name} ${doctor.last_name}`);
      console.log(`Email: ${doctor.email}`);
      console.log(`Phone: ${doctor.phone_number || 'N/A'}`);
      console.log(`Location: ${doctor.city || 'N/A'}, ${doctor.county || 'N/A'}`);
      
      console.log('Availability:');
      if (doctor.availability && doctor.availability.length > 0) {
        doctor.availability.forEach(slot => {
          console.log(`  - ${slot.day_of_week}: ${slot.start_time} - ${slot.end_time}`);
        });
      } else {
        console.log('  No availability set');
      }
    });
    
    console.log('\nTotal doctors found:', doctors.length);
    
  } catch (error) {
    console.error('\nTest failed:', error.message);
  }
}

// Run the test
testDispatcherEndpoints(); 