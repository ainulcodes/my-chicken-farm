# 🐓 Dummy Data Generator - Quick Guide

Generate 300 dummy data ayam Super untuk testing performa aplikasi.

## 🚀 Cara Penggunaan

### Method 1: Node.js Script (RECOMMENDED) ⭐

**NO CORS ISSUES, paling cepat & reliable!**

```bash
# Full dataset (100 indukan, 50 breeding, 150 anakan)
node generate-dummy-node.js

# Test dataset (20 indukan, 10 breeding, 30 anakan)
node generate-dummy-node.js --test
```

**Requirements**: Node.js v12+

### Method 2: Bash/cURL Script (Linux/Mac)

```bash
chmod +x generate-dummy-curl.sh
./generate-dummy-curl.sh
```

**Requirements**: `bash`, `curl`, `date` (GNU coreutils)

## 📊 Data yang Dibuat

| Dataset | Indukan | Breeding | Anakan | Waktu |
|---------|---------|----------|--------|-------|
| **Full** | 100 | 50 | 150 | ~3-5 min |
| **Test** | 20 | 10 | 30 | ~30-60s |

## 🎯 Testing Pagination

Dengan full dataset:
- **Ayam Indukan**: 100 data → ~12 halaman (9 per halaman)
- **Breeding**: 50 data → ~9 halaman (6 per halaman)
- **Ayam Anakan**: 150 data → ~17 halaman (9 per halaman)

## ⚡ Performance Testing

### Tanpa Cache
- Load 300 items: **~2-3 detik** ❌

### Dengan Cache (Setelah implementasi)
- First load: **~2-3 detik** (fetch dari API)
- Second load: **~5-50ms** ✅ (95% lebih cepat!)
- Pagination: **Instant** ✅
- Filter/Search: **<100ms** ✅

## 📁 Files

```
frontend/
├── generate-dummy-node.js          # ⭐ Node.js script (RECOMMENDED)
├── generate-dummy-curl.sh          # Bash/cURL script (Linux/Mac)
├── DUMMY_DATA_README.md            # Quick guide ini (file ini)
└── CARA_GENERATE_DUMMY_DATA.md     # Dokumentasi lengkap
```

## 📋 Step-by-Step Guide (Node.js)

### 1. Pastikan Node.js terinstall
```bash
node --version  # Should be v12 or higher
```

### 2. Masuk ke folder frontend
```bash
cd /projects/my-chicken-farm/frontend
```

### 3. Jalankan script
```bash
# Test dulu dengan dataset kecil
node generate-dummy-node.js --test

# Kalau berhasil, jalankan full dataset
node generate-dummy-node.js
```

### 4. Tunggu proses selesai
- Lihat progress di terminal dengan colored output
- Durasi: ~2-3 menit (full) atau ~30-60s (test)
- Script akan otomatis retry jika ada error

### 5. Refresh aplikasi
- Buka aplikasi di `http://localhost:3000`
- Tekan `Ctrl + R` atau `Cmd + R`
- Data baru akan muncul!

## 📝 Data Realistis

### Ras Ayam Super
Bangkok, Saigon, Burma, Shamo, Asil, Birma, Pakhoy, Pelung, Ciparage, Jepang, Filipino, Lemon, Brazilian, Magon, Siam

### Warna
Hitam, Merah, Putih, Kuning, Biru, Hijau, Abu-abu, Coklat, Emas, Perak, Hitam Putih, Merah Hitam, Kuning Hitam, Belang Tiga, Wido, Laso, Kembang, Blorok

### Kode Systematic
- Jantan: `JTN-001`, `JTN-002`, ...
- Betina: `BTN-001`, `BTN-002`, ...
- Anakan: `ANK-001`, `ANK-002`, ...

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Failed to fetch | Check internet connection |
| Unauthorized | Login to app first |
| Data tidak muncul | Refresh page (Ctrl+R) |
| Script stopped | Check console errors, retry |

## 🎓 Pro Tips

1. **Test dulu**: Jalankan `node generate-dummy-node.js --test` untuk verifikasi
2. **Clear cache**: Tekan Ctrl+Shift+R setelah generate untuk hard reload
3. **Monitor progress**: Lihat colored output di terminal
4. **Batch processing**: Script otomatis delay untuk avoid rate limit
5. **Auto retry**: Script akan otomatis follow redirect dan retry jika ada error
6. **Environment variable**: Script otomatis membaca API URL dari `.env.local`

## 🧹 Cleanup

Untuk hapus dummy data: Manual delete via UI atau truncate Google Sheets.

---

💡 **Pro Tip**: Gunakan Node.js script untuk hasil terbaik - NO CORS issues, auto redirect handling, colored output!
