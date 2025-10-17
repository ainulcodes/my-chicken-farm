/**
 * Cached API Service - Wrapper untuk api-v1.js dengan IndexedDB caching
 * Cache-first approach: Cek cache dulu, baru fetch dari API jika perlu
 */

import { cacheService, STORES } from './cacheService';
import { apiV1 } from './api-v1';

class CachedAPI {
  /**
   * Get Ayam Induk dengan caching
   */
  async getAyamInduk(forceRefresh = false) {
    const startTime = performance.now();

    try {
      // Cek cache dulu
      if (!forceRefresh) {
        const cachedData = await cacheService.get(STORES.AYAM_INDUK);
        if (cachedData && cachedData.length > 0) {
          const loadTime = (performance.now() - startTime).toFixed(2);
          console.log(`%c⚡ CACHE HIT - Ayam Induk`, 'color: #10b981; font-weight: bold; font-size: 14px');
          console.log(`   📦 Items: ${cachedData.length}`);
          console.log(`   ⏱️  Load time: ${loadTime}ms`);
          console.log(`   🔋 Source: IndexedDB`);
          return { success: true, data: cachedData, fromCache: true, loadTime };
        }
      }

      // Fetch dari API jika cache kosong atau force refresh
      console.log(`%c🌐 FETCHING FROM API - Ayam Induk`, 'color: #f59e0b; font-weight: bold; font-size: 14px');
      const apiStartTime = performance.now();
      const data = await apiV1.getAyamInduk(); // Returns array directly
      const apiTime = (performance.now() - apiStartTime).toFixed(2);

      // Simpan ke cache
      await cacheService.set(STORES.AYAM_INDUK, data);

      const totalTime = (performance.now() - startTime).toFixed(2);
      console.log(`%c✅ API SUCCESS - Ayam Induk`, 'color: #10b981; font-weight: bold; font-size: 14px');
      console.log(`   📦 Items: ${data.length}`);
      console.log(`   ⏱️  API time: ${apiTime}ms`);
      console.log(`   ⏱️  Total time: ${totalTime}ms`);
      console.log(`   💾 Cached for future use`);

      return { success: true, data, fromCache: false, loadTime: totalTime, apiTime };
    } catch (error) {
      console.error('Error in getAyamInduk:', error);

      // Fallback ke cache jika API error
      const cachedData = await cacheService.get(STORES.AYAM_INDUK);
      if (cachedData && cachedData.length > 0) {
        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`%c⚠️ STALE CACHE - Ayam Induk (API failed)`, 'color: #ef4444; font-weight: bold; font-size: 14px');
        console.log(`   📦 Items: ${cachedData.length}`);
        console.log(`   ⏱️  Load time: ${loadTime}ms`);
        return { success: true, data: cachedData, fromCache: true, stale: true, loadTime };
      }

      throw error;
    }
  }

  /**
   * Add Ayam Induk dengan optimistic update
   */
  async addAyamInduk(data) {
    try {
      const response = await apiV1.addAyamInduk(data);

      if (response.success && response.data) {
        // Update cache langsung tanpa refetch
        await cacheService.addItem(STORES.AYAM_INDUK, response.data);
        console.log('✓ Cache updated optimistically: Added Ayam Induk');
      }

      return response;
    } catch (error) {
      console.error('Error in addAyamInduk:', error);
      throw error;
    }
  }

  /**
   * Update Ayam Induk dengan optimistic update
   */
  async updateAyamInduk(id, data) {
    try {
      const response = await apiV1.updateAyamInduk(id, data);

      if (response.success) {
        // Update cache langsung tanpa refetch
        const updatedItem = { id, ...data };
        await cacheService.updateItem(STORES.AYAM_INDUK, updatedItem);
        console.log('✓ Cache updated optimistically: Updated Ayam Induk');
      }

      return response;
    } catch (error) {
      console.error('Error in updateAyamInduk:', error);
      // Jika gagal, invalidate cache untuk force refresh next time
      await cacheService.invalidate(STORES.AYAM_INDUK);
      throw error;
    }
  }

  /**
   * Delete Ayam Induk dengan optimistic update
   */
  async deleteAyamInduk(id) {
    try {
      const response = await apiV1.deleteAyamInduk(id);

      if (response.success) {
        // Update cache langsung tanpa refetch
        await cacheService.deleteItem(STORES.AYAM_INDUK, id);
        console.log('✓ Cache updated optimistically: Deleted Ayam Induk');
      }

      return response;
    } catch (error) {
      console.error('Error in deleteAyamInduk:', error);
      // Jika gagal, invalidate cache untuk force refresh next time
      await cacheService.invalidate(STORES.AYAM_INDUK);
      throw error;
    }
  }

  /**
   * Get Breeding dengan caching
   */
  async getBreeding(forceRefresh = false) {
    const startTime = performance.now();

    try {
      // Cek cache dulu
      if (!forceRefresh) {
        const cachedData = await cacheService.get(STORES.BREEDING);
        if (cachedData && cachedData.length > 0) {
          const loadTime = (performance.now() - startTime).toFixed(2);
          console.log(`%c⚡ CACHE HIT - Breeding`, 'color: #10b981; font-weight: bold; font-size: 14px');
          console.log(`   📦 Items: ${cachedData.length}`);
          console.log(`   ⏱️  Load time: ${loadTime}ms`);
          console.log(`   🔋 Source: IndexedDB`);
          return { success: true, data: cachedData, fromCache: true, loadTime };
        }
      }

      // Fetch dari API
      console.log(`%c🌐 FETCHING FROM API - Breeding`, 'color: #f59e0b; font-weight: bold; font-size: 14px');
      const apiStartTime = performance.now();
      const data = await apiV1.getBreeding(); // Returns array directly
      const apiTime = (performance.now() - apiStartTime).toFixed(2);

      await cacheService.set(STORES.BREEDING, data);

      const totalTime = (performance.now() - startTime).toFixed(2);
      console.log(`%c✅ API SUCCESS - Breeding`, 'color: #10b981; font-weight: bold; font-size: 14px');
      console.log(`   📦 Items: ${data.length}`);
      console.log(`   ⏱️  API time: ${apiTime}ms`);
      console.log(`   ⏱️  Total time: ${totalTime}ms`);
      console.log(`   💾 Cached for future use`);

      return { success: true, data, fromCache: false, loadTime: totalTime, apiTime };
    } catch (error) {
      console.error('Error in getBreeding:', error);

      // Fallback ke cache
      const cachedData = await cacheService.get(STORES.BREEDING);
      if (cachedData && cachedData.length > 0) {
        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`%c⚠️ STALE CACHE - Breeding (API failed)`, 'color: #ef4444; font-weight: bold; font-size: 14px');
        console.log(`   📦 Items: ${cachedData.length}`);
        console.log(`   ⏱️  Load time: ${loadTime}ms`);
        return { success: true, data: cachedData, fromCache: true, stale: true, loadTime };
      }

      throw error;
    }
  }

  /**
   * Add Breeding dengan optimistic update
   */
  async addBreeding(data) {
    try {
      const response = await apiV1.addBreeding(data);

      if (response.success && response.data) {
        await cacheService.addItem(STORES.BREEDING, response.data);
        console.log('✓ Cache updated optimistically: Added Breeding');
      }

      return response;
    } catch (error) {
      console.error('Error in addBreeding:', error);
      throw error;
    }
  }

  /**
   * Update Breeding dengan optimistic update
   */
  async updateBreeding(id, data) {
    try {
      const response = await apiV1.updateBreeding(id, data);

      if (response.success) {
        const updatedItem = { id, ...data };
        await cacheService.updateItem(STORES.BREEDING, updatedItem);
        console.log('✓ Cache updated optimistically: Updated Breeding');
      }

      return response;
    } catch (error) {
      console.error('Error in updateBreeding:', error);
      await cacheService.invalidate(STORES.BREEDING);
      throw error;
    }
  }

  /**
   * Delete Breeding dengan optimistic update
   */
  async deleteBreeding(id) {
    try {
      const response = await apiV1.deleteBreeding(id);

      if (response.success) {
        await cacheService.deleteItem(STORES.BREEDING, id);
        console.log('✓ Cache updated optimistically: Deleted Breeding');
      }

      return response;
    } catch (error) {
      console.error('Error in deleteBreeding:', error);
      await cacheService.invalidate(STORES.BREEDING);
      throw error;
    }
  }

  /**
   * Get Ayam Anakan dengan caching
   */
  async getAyamAnakan(breedingId = null, forceRefresh = false) {
    const startTime = performance.now();

    try {
      // Cek cache dulu
      if (!forceRefresh) {
        const cachedData = await cacheService.get(STORES.AYAM_ANAKAN);
        if (cachedData && cachedData.length > 0) {
          // Filter by breedingId jika ada
          const filteredData = breedingId
            ? cachedData.filter(a => a.breedingId === breedingId)
            : cachedData;

          const loadTime = (performance.now() - startTime).toFixed(2);
          console.log(`%c⚡ CACHE HIT - Ayam Anakan`, 'color: #10b981; font-weight: bold; font-size: 14px');
          console.log(`   📦 Items: ${filteredData.length}${breedingId ? ` (filtered for breeding: ${breedingId})` : ''}`);
          console.log(`   ⏱️  Load time: ${loadTime}ms`);
          console.log(`   🔋 Source: IndexedDB`);

          return { success: true, data: filteredData, fromCache: true, loadTime };
        }
      }

      // Fetch dari API
      console.log(`%c🌐 FETCHING FROM API - Ayam Anakan`, 'color: #f59e0b; font-weight: bold; font-size: 14px');
      const apiStartTime = performance.now();
      const data = await apiV1.getAyamAnakan(breedingId); // Returns array directly
      const apiTime = (performance.now() - apiStartTime).toFixed(2);

      // Jika breedingId spesifik, merge dengan cache existing
      if (breedingId) {
        const existingCache = await cacheService.get(STORES.AYAM_ANAKAN);
        const otherData = existingCache ? existingCache.filter(a => a.breedingId !== breedingId) : [];
        const mergedData = [...otherData, ...data];
        await cacheService.set(STORES.AYAM_ANAKAN, mergedData);
      } else {
        await cacheService.set(STORES.AYAM_ANAKAN, data);
      }

      const totalTime = (performance.now() - startTime).toFixed(2);
      console.log(`%c✅ API SUCCESS - Ayam Anakan`, 'color: #10b981; font-weight: bold; font-size: 14px');
      console.log(`   📦 Items: ${data.length}`);
      console.log(`   ⏱️  API time: ${apiTime}ms`);
      console.log(`   ⏱️  Total time: ${totalTime}ms`);
      console.log(`   💾 Cached for future use`);

      return { success: true, data, fromCache: false, loadTime: totalTime, apiTime };
    } catch (error) {
      console.error('Error in getAyamAnakan:', error);

      // Fallback ke cache
      const cachedData = await cacheService.get(STORES.AYAM_ANAKAN);
      if (cachedData && cachedData.length > 0) {
        const filteredData = breedingId
          ? cachedData.filter(a => a.breedingId === breedingId)
          : cachedData;

        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`%c⚠️ STALE CACHE - Ayam Anakan (API failed)`, 'color: #ef4444; font-weight: bold; font-size: 14px');
        console.log(`   📦 Items: ${filteredData.length}`);
        console.log(`   ⏱️  Load time: ${loadTime}ms`);

        return { success: true, data: filteredData, fromCache: true, stale: true, loadTime };
      }

      throw error;
    }
  }

  /**
   * Add Ayam Anakan dengan optimistic update
   */
  async addAyamAnakan(data) {
    try {
      const response = await apiV1.addAyamAnakan(data);

      if (response.success && response.data) {
        await cacheService.addItem(STORES.AYAM_ANAKAN, response.data);
        console.log('✓ Cache updated optimistically: Added Ayam Anakan');
      }

      return response;
    } catch (error) {
      console.error('Error in addAyamAnakan:', error);
      throw error;
    }
  }

  /**
   * Update Ayam Anakan dengan optimistic update
   */
  async updateAyamAnakan(id, data) {
    try {
      const response = await apiV1.updateAyamAnakan(id, data);

      if (response.success) {
        const updatedItem = { id, ...data };
        await cacheService.updateItem(STORES.AYAM_ANAKAN, updatedItem);
        console.log('✓ Cache updated optimistically: Updated Ayam Anakan');
      }

      return response;
    } catch (error) {
      console.error('Error in updateAyamAnakan:', error);
      await cacheService.invalidate(STORES.AYAM_ANAKAN);
      throw error;
    }
  }

  /**
   * Delete Ayam Anakan dengan optimistic update
   */
  async deleteAyamAnakan(id) {
    try {
      const response = await apiV1.deleteAyamAnakan(id);

      if (response.success) {
        await cacheService.deleteItem(STORES.AYAM_ANAKAN, id);
        console.log('✓ Cache updated optimistically: Deleted Ayam Anakan');
      }

      return response;
    } catch (error) {
      console.error('Error in deleteAyamAnakan:', error);
      await cacheService.invalidate(STORES.AYAM_ANAKAN);
      throw error;
    }
  }

  /**
   * Force refresh semua data (manual sync)
   */
  async refreshAll() {
    console.log('→ Force refreshing all data...');

    const results = await Promise.allSettled([
      this.getAyamInduk(true),
      this.getBreeding(true),
      this.getAyamAnakan(null, true)
    ]);

    const summary = {
      ayamInduk: results[0].status === 'fulfilled',
      breeding: results[1].status === 'fulfilled',
      ayamAnakan: results[2].status === 'fulfilled'
    };

    console.log('✓ Refresh completed:', summary);
    return summary;
  }

  /**
   * Clear semua cache
   */
  async clearCache() {
    await cacheService.clearAll();
    console.log('✓ All cache cleared');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await cacheService.getStats();
  }
}

// Export singleton instance
export const cachedAPI = new CachedAPI();
