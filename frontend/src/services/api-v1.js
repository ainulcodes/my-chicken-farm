import axios from 'axios';

// V1: Simple API without authentication
const SHEETS_API_URL = process.env.REACT_APP_SHEETS_API_URL || '';

class SheetsAPIV1 {
  constructor() {
    this.baseURL = SHEETS_API_URL;

    // Validate API URL is configured
    if (!this.baseURL || this.baseURL === '') {
      console.error('❌ REACT_APP_SHEETS_API_URL tidak dikonfigurasi di .env.local!');
      console.error('Tambahkan: REACT_APP_SHEETS_API_URL=YOUR_WEB_APP_URL');
    } else {
      console.log('✅ API URL configured:', this.baseURL);
    }
  }

  // Ayam Induk APIs
  async getAyamInduk() {
    try {
      const response = await axios.get(`${this.baseURL}?path=ayam_induk`);
      return response.data.data || [];
    } catch (error) {
      console.error('Get ayam induk error:', error);
      return [];
    }
  }

  async addAyamInduk(data) {
    try {
      console.log('📤 Sending add ayam induk:', data);
      // Use GET with action parameter (CORS workaround for Google Apps Script)
      const params = new URLSearchParams({
        action: 'add_ayam_induk',
        ...data
      });
      const response = await axios.get(`${this.baseURL}?${params}`);
      console.log('✅ Add ayam induk response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Add ayam induk error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async updateAyamInduk(id, data) {
    try {
      console.log('📤 Sending update ayam induk:', { id, ...data });
      const params = new URLSearchParams({
        action: 'update_ayam_induk',
        id,
        ...data
      });
      const response = await axios.get(`${this.baseURL}?${params}`);
      console.log('✅ Update ayam induk response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update ayam induk error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async deleteAyamInduk(id) {
    const params = new URLSearchParams({
      action: 'delete_ayam_induk',
      id
    });
    const response = await axios.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  // Breeding APIs
  async getBreeding() {
    try {
      const response = await axios.get(`${this.baseURL}?path=breeding`);
      return response.data.data || [];
    } catch (error) {
      console.error('Get breeding error:', error);
      return [];
    }
  }

  async addBreeding(data) {
    const params = new URLSearchParams({
      action: 'add_breeding',
      ...data
    });
    const response = await axios.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  async updateBreeding(id, data) {
    const params = new URLSearchParams({
      action: 'update_breeding',
      id,
      ...data
    });
    const response = await axios.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  async deleteBreeding(id) {
    const params = new URLSearchParams({
      action: 'delete_breeding',
      id
    });
    const response = await axios.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  // Ayam Anakan APIs
  async getAyamAnakan(breedingId = null) {
    try {
      let url = `${this.baseURL}?path=ayam_anakan`;
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
    const params = new URLSearchParams({
      action: 'add_ayam_anakan',
      ...data
    });
    const response = await axios.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  async updateAyamAnakan(id, data) {
    const params = new URLSearchParams({
      action: 'update_ayam_anakan',
      id,
      ...data
    });
    const response = await axios.get(`${this.baseURL}?${params}`);
    return response.data;
  }

  async deleteAyamAnakan(id) {
    const params = new URLSearchParams({
      action: 'delete_ayam_anakan',
      id
    });
    const response = await axios.get(`${this.baseURL}?${params}`);
    return response.data;
  }
}

export const apiV1 = new SheetsAPIV1();
