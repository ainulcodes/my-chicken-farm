import axios from 'axios';

// V1: Simple API without authentication
const SHEETS_API_URL = process.env.REACT_APP_SHEETS_API_URL || '';

class SheetsAPIV1 {
  constructor() {
    this.baseURL = SHEETS_API_URL;
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
    const response = await axios.post(this.baseURL, {
      action: 'add_ayam_induk',
      ...data
    });
    return response.data;
  }

  async updateAyamInduk(id, data) {
    const response = await axios.post(this.baseURL, {
      action: 'update_ayam_induk',
      id,
      ...data
    });
    return response.data;
  }

  async deleteAyamInduk(id) {
    const response = await axios.post(this.baseURL, {
      action: 'delete_ayam_induk',
      id
    });
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
    const response = await axios.post(this.baseURL, {
      action: 'add_breeding',
      ...data
    });
    return response.data;
  }

  async updateBreeding(id, data) {
    const response = await axios.post(this.baseURL, {
      action: 'update_breeding',
      id,
      ...data
    });
    return response.data;
  }

  async deleteBreeding(id) {
    const response = await axios.post(this.baseURL, {
      action: 'delete_breeding',
      id
    });
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
    const response = await axios.post(this.baseURL, {
      action: 'add_ayam_anakan',
      ...data
    });
    return response.data;
  }

  async updateAyamAnakan(id, data) {
    const response = await axios.post(this.baseURL, {
      action: 'update_ayam_anakan',
      id,
      ...data
    });
    return response.data;
  }

  async deleteAyamAnakan(id) {
    const response = await axios.post(this.baseURL, {
      action: 'delete_ayam_anakan',
      id
    });
    return response.data;
  }
}

export const apiV1 = new SheetsAPIV1();
