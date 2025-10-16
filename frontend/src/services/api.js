import axios from 'axios';

// For static deployment, use Google Sheets API
const SHEETS_API_URL = process.env.REACT_APP_SHEETS_API_URL || '';

class SheetsAPI {
  constructor() {
    this.baseURL = SHEETS_API_URL;
  }

  getUserEmail() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || '';
  }

  async login(userData) {
    try {
      const response = await axios.post(this.baseURL, {
        action: 'login',
        email: userData.email,
        display_name: userData.name,
        photo_url: userData.picture,
        uid: userData.sub
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Ayam Induk APIs
  async getAyamInduk() {
    try {
      const userEmail = this.getUserEmail();
      const response = await axios.get(`${this.baseURL}?path=ayam_induk&userEmail=${userEmail}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Get ayam induk error:', error);
      return [];
    }
  }

  async addAyamInduk(data) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'add_ayam_induk',
      userEmail,
      ...data
    });
    return response.data;
  }

  async updateAyamInduk(id, data) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'update_ayam_induk',
      userEmail,
      id,
      ...data
    });
    return response.data;
  }

  async deleteAyamInduk(id) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'delete_ayam_induk',
      userEmail,
      id
    });
    return response.data;
  }

  // Breeding APIs
  async getBreeding() {
    try {
      const userEmail = this.getUserEmail();
      const response = await axios.get(`${this.baseURL}?path=breeding&userEmail=${userEmail}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Get breeding error:', error);
      return [];
    }
  }

  async addBreeding(data) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'add_breeding',
      userEmail,
      ...data
    });
    return response.data;
  }

  async updateBreeding(id, data) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'update_breeding',
      userEmail,
      id,
      ...data
    });
    return response.data;
  }

  async deleteBreeding(id) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'delete_breeding',
      userEmail,
      id
    });
    return response.data;
  }

  // Ayam Anakan APIs
  async getAyamAnakan(breedingId = null) {
    try {
      const userEmail = this.getUserEmail();
      let url = `${this.baseURL}?path=ayam_anakan&userEmail=${userEmail}`;
      if (breedingId) {
        url += `&breeding_id=${breedingId}`;
      }
      const response = await axios.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Get ayam anakan error:', error);
      return [];
    }
  }

  async addAyamAnakan(data) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'add_ayam_anakan',
      userEmail,
      ...data
    });
    return response.data;
  }

  async updateAyamAnakan(id, data) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'update_ayam_anakan',
      userEmail,
      id,
      ...data
    });
    return response.data;
  }

  async deleteAyamAnakan(id) {
    const userEmail = this.getUserEmail();
    const response = await axios.post(this.baseURL, {
      action: 'delete_ayam_anakan',
      userEmail,
      id
    });
    return response.data;
  }
}

export const api = new SheetsAPI();
