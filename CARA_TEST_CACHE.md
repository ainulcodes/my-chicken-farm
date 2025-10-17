# 🧪 Cara Test Cache Performance

## Yang Sudah Diimplementasikan

✅ **Colored console logs** dengan timer performa
✅ **Toast notifications** dengan load time
✅ **Cache indicator** di UI

## Cara Test

### 1. Buka Browser Console

1. Buka website di browser
2. Tekan `F12` atau `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
3. Pilih tab **Console**

### 2. Test Scenario 1: Cold Start (Cache Kosong)

**Langkah:**
1. Buka DevTools → Application → IndexedDB
2. Klik kanan `chickenFarmDB` → Delete database
3. Refresh page (`F5`)

**Yang Harus Anda Lihat:**

Di **Console** akan muncul:
```
🌐 FETCHING FROM API - Ayam Induk  (warna orange)
   📦 Items: X
   ⏱️  API time: 2000-3000ms    ← LAMBAT (normal)
   ⏱️  Total time: 2000-3000ms
   💾 Cached for future use
```

Di **UI** akan muncul toast:
```
✅ Loaded X items in 2500ms
```

### 3. Test Scenario 2: Warm Start (Dari Cache)

**Langkah:**
1. Setelah test 1 selesai
2. Refresh page lagi (`F5`)

**Yang Harus Anda Lihat:**

Di **Console** akan muncul:
```
⚡ CACHE HIT - Ayam Induk  (warna hijau)
   📦 Items: X
   ⏱️  Load time: 5-50ms    ← CEPAT BANGET!
   🔋 Source: IndexedDB
```

Di **UI** akan muncul toast:
```
⚡ Loaded X items in 15ms (from cache)
```

**Perbandingan:**
- First load: **2000-3000ms** (2-3 detik)
- From cache: **5-50ms** (0.005-0.05 detik)
- **Speedup: 40-600x lebih cepat!**

### 4. Test Scenario 3: Manual Refresh

**Langkah:**
1. Klik tombol **🔄 Refresh** di UI

**Yang Harus Anda Lihat:**

Di **Console** akan muncul:
```
🌐 FETCHING FROM API - Ayam Induk
   📦 Items: X
   ⏱️  API time: 2000-3000ms
   ⏱️  Total time: 2000-3000ms
   💾 Cached for future use
```

Di **UI** akan muncul toast:
```
✅ Synced X items in 2500ms
```

### 5. Test Scenario 4: Add/Update/Delete (Optimistic Updates)

**Langkah:**
1. Klik **+ Tambah Indukan**
2. Isi form
3. Klik **Simpan**

**Yang Harus Anda Lihat:**

- **TIDAK ADA** log "🌐 FETCHING FROM API" untuk get data
- Data langsung muncul di list (instant)
- Toast: "Ayam indukan berhasil ditambahkan"

**Perbandingan:**
- Old way: Save → Refetch all data → 2-3 detik delay
- New way: Save → Update local state → **INSTANT**

### 6. Cek Cache di IndexedDB

**Langkah:**
1. DevTools → Application → IndexedDB
2. Expand `chickenFarmDB`
3. Klik `ayam_induk` / `breeding` / `ayam_anakan`
4. Lihat data tersimpan

**Yang Harus Anda Lihat:**
- Semua data tersimpan dengan ID
- Metadata dengan timestamp

---

## Interpretasi Results

### ✅ Cache BEKERJA dengan Baik:

**Console logs:**
```
⚡ CACHE HIT - Ayam Induk  (hijau)
   ⏱️  Load time: 5-50ms
```

**Toast:**
```
⚡ Loaded X items in 15ms (from cache)
```

### ❌ Cache TIDAK Bekerja:

**Console logs:**
```
🌐 FETCHING FROM API - Ayam Induk  (orange)
   ⏱️  API time: 2000-3000ms
```

Setiap kali refresh, padahal baru saja load.

**Penyebab:**
1. Cache expired (> 5 menit)
2. IndexedDB tidak support browser
3. Ada error saat save cache

### ⚠️ Stale Cache (Offline Mode):

**Console logs:**
```
⚠️ STALE CACHE - Ayam Induk (API failed)  (merah)
   ⏱️  Load time: 15ms
```

**Toast:**
```
Menggunakan data offline (koneksi bermasalah)
```

---

## Benchmark Performance

Hasil yang diharapkan:

| Scenario | Time | Status |
|----------|------|--------|
| First load (cold cache) | 2000-3000ms | 🟡 Normal |
| Second load (warm cache) | 5-50ms | ✅ Excellent |
| Third load (warm cache) | 5-50ms | ✅ Excellent |
| Add/Update/Delete UI update | <10ms | ✅ Instant |
| Manual refresh | 2000-3000ms | 🟡 Normal |

---

## Troubleshooting

### Q: Kenapa masih lambat setiap kali load?

**A:** Cek console logs:
- Jika selalu "🌐 FETCHING FROM API" → Cache tidak bekerja
- Kemungkinan:
  1. Browser tidak support IndexedDB (cek: IE, browser lama)
  2. Private/Incognito mode (IndexedDB disabled)
  3. Storage quota penuh

**Fix:**
```javascript
// Test di console
if ('indexedDB' in window) {
  console.log('✅ IndexedDB supported');
} else {
  console.log('❌ IndexedDB NOT supported');
}
```

### Q: Data tidak update setelah edit?

**A:** Cek console logs untuk error. Jika ada error, code akan auto-refetch:
```javascript
catch (error) {
  loadData(); // Fallback refetch
}
```

### Q: Bagaimana clear cache manual?

**A:** Di console:
```javascript
// Import service
const { cachedAPI } = await import('./services/cachedApi');

// Clear all cache
await cachedAPI.clearCache();
console.log('✅ Cache cleared');

// Check stats
const stats = await cachedAPI.getCacheStats();
console.table(stats);
```

### Q: Bagaimana adjust cache expiry time?

**A:** Edit `/frontend/src/services/cacheService.js`:
```javascript
// Line 10 - default 5 menit
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

// Ganti jadi 15 menit:
const CACHE_EXPIRY_MS = 15 * 60 * 1000;

// Ganti jadi 1 jam:
const CACHE_EXPIRY_MS = 60 * 60 * 1000;
```

---

## Expected Console Output Examples

### Contoh 1: First Load (Cold Cache)
```
🌐 FETCHING FROM API - Ayam Induk
   📦 Items: 15
   ⏱️  API time: 2453.50ms
   ⏱️  Total time: 2467.80ms
   💾 Cached for future use

✅ API URL configured: https://script.google.com/...
```

### Contoh 2: Second Load (Warm Cache)
```
⚡ CACHE HIT - Ayam Induk
   📦 Items: 15
   ⏱️  Load time: 12.30ms
   🔋 Source: IndexedDB
```

### Contoh 3: Add New Item (Optimistic)
```
📤 Sending add ayam induk: {kode: "IND-016", ...}
✅ Add ayam induk response: {success: true, data: {...}}
✓ Cache updated optimistically: Added Ayam Induk
```

### Contoh 4: Offline Mode
```
⚠️ STALE CACHE - Ayam Induk (API failed)
   📦 Items: 15
   ⏱️  Load time: 18.20ms
```

---

## Quick Test Commands

Paste di browser console untuk test:

```javascript
// 1. Test cache hit/miss
const { cachedAPI } = await import('./services/cachedApi.js');
await cachedAPI.getAyamInduk(); // Should hit cache

// 2. Force refresh
await cachedAPI.getAyamInduk(true); // Force API call

// 3. Check stats
const stats = await cachedAPI.getCacheStats();
console.table(stats);

// 4. Clear cache
await cachedAPI.clearCache();

// 5. Test performance
console.time('Load from cache');
await cachedAPI.getAyamInduk();
console.timeEnd('Load from cache');
```

---

## Summary

✅ **Cache bekerja** jika:
- Load time < 50ms setelah first load
- Console log: "⚡ CACHE HIT" (hijau)
- Toast: "⚡ Loaded X items in XXms (from cache)"

❌ **Cache tidak bekerja** jika:
- Setiap load selalu 2-3 detik
- Console log: "🌐 FETCHING FROM API" terus
- Tidak ada data di IndexedDB

🔄 **Next step jika lambat**:
1. Clear cache: `cachedAPI.clearCache()`
2. Refresh page
3. Cek console logs untuk pattern
4. Screenshot logs dan share untuk debugging
