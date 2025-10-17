/**
 * IndexedDB Cache Service untuk Offline-First Data Management
 * Menyimpan data dari Google Sheets di browser untuk akses cepat
 */

const DB_NAME = 'chickenFarmDB';
const DB_VERSION = 1;
const STORES = {
  AYAM_INDUK: 'ayam_induk',
  BREEDING: 'breeding',
  AYAM_ANAKAN: 'ayam_anakan',
  METADATA: 'metadata'
};

// Cache expiration time (5 menit)
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

class CacheService {
  constructor() {
    this.db = null;
  }

  /**
   * Inisialisasi IndexedDB
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            if (storeName === STORES.METADATA) {
              db.createObjectStore(storeName, { keyPath: 'key' });
            } else {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          }
        });
      };
    });
  }

  /**
   * Cek apakah cache masih valid
   */
  async isCacheValid(storeName) {
    try {
      await this.init();
      const metadata = await this.getMetadata(storeName);

      if (!metadata || !metadata.lastFetch) {
        return false;
      }

      const now = Date.now();
      const timeDiff = now - metadata.lastFetch;
      return timeDiff < CACHE_EXPIRY_MS;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Get data dari cache
   */
  async get(storeName) {
    try {
      await this.init();

      // Cek validitas cache
      const isValid = await this.isCacheValid(storeName);
      if (!isValid) {
        console.log(`Cache expired for ${storeName}`);
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error getting cache for ${storeName}:`, error);
      return null;
    }
  }

  /**
   * Set data ke cache
   */
  async set(storeName, data) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName, STORES.METADATA], 'readwrite');
        const store = transaction.objectStore(storeName);

        // Clear existing data
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          // Add new data
          data.forEach(item => {
            store.add(item);
          });

          // Update metadata
          const metaStore = transaction.objectStore(STORES.METADATA);
          metaStore.put({
            key: storeName,
            lastFetch: Date.now(),
            count: data.length
          });
        };

        transaction.oncomplete = () => {
          console.log(`Cache updated for ${storeName}: ${data.length} items`);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error(`Error setting cache for ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Update single item di cache
   */
  async updateItem(storeName, item) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
          console.log(`Item updated in ${storeName}:`, item.id);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error updating item in ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Add single item ke cache
   */
  async addItem(storeName, item) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName, STORES.METADATA], 'readwrite');
        const store = transaction.objectStore(storeName);
        const addRequest = store.add(item);

        addRequest.onsuccess = () => {
          // Update count in metadata
          const metaStore = transaction.objectStore(STORES.METADATA);
          const getMetaRequest = metaStore.get(storeName);

          getMetaRequest.onsuccess = () => {
            const metadata = getMetaRequest.result || { key: storeName, lastFetch: Date.now(), count: 0 };
            metadata.count = (metadata.count || 0) + 1;
            metaStore.put(metadata);
          };
        };

        transaction.oncomplete = () => {
          console.log(`Item added to ${storeName}:`, item.id);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error(`Error adding item to ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Delete single item dari cache
   */
  async deleteItem(storeName, id) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName, STORES.METADATA], 'readwrite');
        const store = transaction.objectStore(storeName);
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
          // Update count in metadata
          const metaStore = transaction.objectStore(STORES.METADATA);
          const getMetaRequest = metaStore.get(storeName);

          getMetaRequest.onsuccess = () => {
            const metadata = getMetaRequest.result;
            if (metadata) {
              metadata.count = Math.max(0, (metadata.count || 0) - 1);
              metaStore.put(metadata);
            }
          };
        };

        transaction.oncomplete = () => {
          console.log(`Item deleted from ${storeName}:`, id);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error(`Error deleting item from ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Get metadata (last fetch time, count, etc)
   */
  async getMetadata(storeName) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORES.METADATA], 'readonly');
        const store = transaction.objectStore(STORES.METADATA);
        const request = store.get(storeName);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error getting metadata for ${storeName}:`, error);
      return null;
    }
  }

  /**
   * Invalidate cache (force refresh next time)
   */
  async invalidate(storeName) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORES.METADATA], 'readwrite');
        const store = transaction.objectStore(STORES.METADATA);
        const request = store.delete(storeName);

        request.onsuccess = () => {
          console.log(`Cache invalidated for ${storeName}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error invalidating cache for ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    try {
      await this.init();

      const stores = Object.values(STORES);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(stores, 'readwrite');

        stores.forEach(storeName => {
          transaction.objectStore(storeName).clear();
        });

        transaction.oncomplete = () => {
          console.log('All cache cleared');
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Error clearing all cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      await this.init();

      const stats = {};
      const stores = [STORES.AYAM_INDUK, STORES.BREEDING, STORES.AYAM_ANAKAN];

      for (const storeName of stores) {
        const metadata = await this.getMetadata(storeName);
        const isValid = await this.isCacheValid(storeName);

        stats[storeName] = {
          count: metadata?.count || 0,
          lastFetch: metadata?.lastFetch ? new Date(metadata.lastFetch).toLocaleString('id-ID') : 'Never',
          isValid,
          expiresIn: metadata?.lastFetch
            ? Math.max(0, Math.ceil((CACHE_EXPIRY_MS - (Date.now() - metadata.lastFetch)) / 1000))
            : 0
        };
      }

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {};
    }
  }
}

// Export singleton instance
const cacheService = new CacheService();

export { cacheService, STORES };
