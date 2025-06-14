import axios from 'axios';

const API_URL = 'http://localhost:5000/api/loyalty';

class LoyaltyService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      withCredentials: false
    });

    // Add a request interceptor to include the auth token
    this.api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['x-auth-token'] = token;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  // Get the user's loyalty card
  async getLoyaltyCard() {
    try {
      const response = await this.api.get('/card');
      return response.data;
    } catch (error) {
      console.error('Error getting loyalty card:', error);
      throw error;
    }
  }

  // Get all available loyalty packages
  async getLoyaltyPackages() {
    try {
      const response = await this.api.get('/packages');
      return response.data;
    } catch (error) {
      console.error('Error getting loyalty packages:', error);
      throw error;
    }
  }

  // Redeem a loyalty package
  async redeemPackage(packageId) {
    try {
      const response = await this.api.post('/redeem', { package_id: packageId });
      return response.data;
    } catch (error) {
      console.error('Error redeeming package:', error);
      throw error;
    }
  }

  // Get redemption history
  async getRedemptionHistory() {
    try {
      const response = await this.api.get('/redemptions');
      return response.data;
    } catch (error) {
      console.error('Error getting redemption history:', error);
      throw error;
    }
  }
}

export default new LoyaltyService(); 