# 🐓 Cara Generate Dummy Data Ayam Super

Script ini akan membuat data dummy untuk menguji performa aplikasi dengan dataset yang lebih besar.

## 📊 Data yang Akan Dibuat

- **100 Ayam Indukan** (50 Jantan, 50 Betina)
  - Berbagai ras: Bangkok, Saigon, Burma, Shamo, Asil, dll
  - Berbagai warna: Hitam, Merah, Putih, Kuning, Belang, dll
  - Tanggal lahir random 1-5 tahun yang lalu

- **50 Data Breeding**
  - Pasangan random dari ayam jantan dan betina
  - Tanggal kawin dalam 1-2 tahun terakhir
  - Tanggal menetas 21 hari setelah kawin
  - Jumlah anakan 2-8 ekor

- **150 Ayam Anakan**
  - Terdistribusi dari 50 breeding
  - Warna campuran dari induk
  - Status: 80% Sehat, 20% random (Sakit/Dijual/Mati)

## 🚀 Cara Penggunaan

### Metode 1: Node.js Script (RECOMMENDED) ⭐

**Paling cepat, paling reliable, NO CORS issues!**

1. **Pastikan Node.js terinstall**
   ```bash
   node --version  # v12 or higher
   ```

2. **Masuk ke folder frontend**
   ```bash
   cd /projects/my-chicken-farm/frontend
   ```

3. **Jalankan script**
   ```bash
   # Test dulu dengan dataset kecil (20 indukan, 10 breeding, 30 anakan)
   node generate-dummy-node.js --test

   # Full dataset (100 indukan, 50 breeding, 150 anakan)
   node generate-dummy-node.js
   ```

4. **Tunggu proses selesai** (2-3 menit untuk full dataset)

5. **Refresh aplikasi** untuk melihat data baru

### Metode 2: Bash/cURL Script (Linux/Mac)

**Untuk yang prefer shell script**

1. **Make executable**
   ```bash
   chmod +x generate-dummy-curl.sh
   ```

2. **Jalankan script**
   ```bash
   ./generate-dummy-curl.sh
   ```

3. **Tunggu selesai** (5-7 menit)

4. **Refresh aplikasi**

## ⚡ Output yang Diharapkan (Node.js)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐓 DUMMY DATA GENERATOR - AYAM Super (Node.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 API URL: https://script.google.com/macros/s/AKfycbz...

━━━━━ STEP 1: AYAM INDUKAN ━━━━━
🐓 Generating 100 Ayam Indukan...
📦 Batch 1/20 (5 items)...
⏳ Waiting 2s before next batch...
...
✅ Inserted 100/100 items
✓ Total Indukan in database: 100

━━━━━ STEP 2: BREEDING DATA ━━━━━
💑 Generating 50 Breeding records...
Available: 50 Jantan, 50 Betina
...
✓ Total Breeding in database: 50

━━━━━ STEP 3: AYAM ANAKAN ━━━━━
🐣 Generating 150 Ayam Anakan...
...
✓ Total Anakan in database: 150

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DUMMY DATA GENERATION COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
   🐓 Ayam Indukan: 100 / 100
   💑 Breeding: 50 / 50
   🐣 Ayam Anakan: 150 / 150

⏱️  Total time: 180.23s

💡 Tip: Refresh aplikasi untuk melihat data baru!
```

## 🧪 Test Mode (Dataset Lebih Kecil)

Untuk testing cepat dengan dataset kecil:

```bash
node generate-dummy-node.js --test
```

Akan membuat:
- 20 Ayam Indukan (10 Jantan, 10 Betina)
- 10 Breeding
- 30 Ayam Anakan

Lebih cepat (~30-60 detik) untuk testing cepat.

## 📝 Fitur Script

### Auto-Configuration
- Otomatis membaca API URL dari `.env.local` atau `.env`
- Fallback ke hardcoded URL jika tidak ada

### Redirect Handling
- Otomatis follow redirect dari Google Apps Script
- Tidak ada CORS issues seperti browser

### Batching & Rate Limiting
- Insert data dalam batch (5 items per batch)
- Delay 2 detik antar batch untuk menghindari rate limit
- Progress indicator untuk setiap batch

### Data Realistis
- **Ras Ayam Super**: Bangkok, Saigon, Burma, Shamo, Asil, Birma, Pakhoy, Pelung, Ciparage, Jepang, Filipino, Lemon, Brazilian, Magon, Siam

- **Warna**: Hitam, Merah, Putih, Kuning, Biru, Hijau, Abu-abu, Coklat, Emas, Perak, Hitam Putih, Merah Hitam, Kuning Hitam, Belang Tiga, Wido, Laso, Kembang, Blorok

- **Kode Systematic**:
  - Jantan: `JTN-001`, `JTN-002`, ...
  - Betina: `BTN-001`, `BTN-002`, ...
  - Anakan: `ANK-001`, `ANK-002`, ...

### Error Handling
- Retry mechanism untuk failed requests
- Summary sukses/gagal di akhir
- Detailed error logging dengan warna
- Debug output untuk troubleshooting

### Colored Output
- 🟢 Green: Success messages
- 🔵 Blue: Info & section headers
- 🟡 Yellow: Warnings & waiting
- 🔴 Red: Errors

## ⚠️ Important Notes

1. **Node.js required**: Pastikan Node.js v12+ terinstall
2. **Koneksi internet stabil** diperlukan
3. **API URL**: Script otomatis membaca dari `.env.local`
4. **Batch processing**: Script otomatis delay untuk avoid rate limit
5. **Error handling**: Script akan continue jika ada error

## 🔍 Troubleshooting

### Error: "command not found: node"
**Solusi**: Install Node.js dari https://nodejs.org/

### Error: "Failed to fetch" / "Invalid JSON response"
**Solusi**:
- Check koneksi internet
- Pastikan API URL di `.env.local` benar
- Coba jalankan dengan `--test` flag dulu

### Data tidak muncul setelah selesai
**Solusi**:
- Refresh halaman (Ctrl+R atau Cmd+R)
- Hard refresh (Ctrl+Shift+R atau Cmd+Shift+R)
- Check Google Sheets untuk verifikasi data

### Script terlalu lambat
**Solusi**:
- Ini normal karena ada delay 2 detik antar batch
- Full dataset (100 indukan) butuh ~2-3 menit
- Bisa edit `batchSize` dan `sleep` duration di script jika perlu

## 🎯 Tujuan Testing

Dengan 300 total data (100 indukan + 50 breeding + 150 anakan):

✅ **Test Pagination**
- Ayam Indukan: 100 ÷ 9 = ~12 halaman
- Breeding: 50 ÷ 6 = ~9 halaman
- Ayam Anakan: 150 ÷ 9 = ~17 halaman

✅ **Test Caching Performance**
- First load: Fetch dari API (~2-3 detik)
- Second load: Load dari cache (~5-50ms)
- 95%+ improvement!

✅ **Test Filter & Search**
- Filter breeding di anakan
- Search functionality
- Sort & filter combinations

✅ **Test CRUD Performance**
- Add/Edit/Delete dengan large dataset
- Optimistic updates
- Cache invalidation

## 📈 Performance Benchmarks (Target)

| Metric | Target | With Cache |
|--------|--------|------------|
| Initial Load (300 items) | 2-3s | 2-3s |
| Subsequent Load | 5-50ms | ✅ |
| Pagination Switch | Instant | ✅ |
| Filter/Search | < 100ms | ✅ |
| Add/Edit/Delete | < 1s | ✅ |

## 🧹 Cleanup (Hapus Dummy Data)

Untuk menghapus data dummy, bisa manual delete via UI atau truncate sheets di Google Sheets.

**NOTE**: Script ini hanya untuk development/testing. Jangan jalankan di production!

---

💡 **Pro Tip**: Jalankan `node generate-dummy-node.js --test` dulu untuk verifikasi script, baru jalankan full dataset dengan `node generate-dummy-node.js`.
