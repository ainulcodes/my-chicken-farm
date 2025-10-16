# 🔀 Panduan: Memilih V1 atau V2

## 🤔 Perbedaan V1 vs V2

### 🟢 V1 - Simple (Tanpa Login)

**Kelebihan:**
- ✅ Setup lebih cepat (~5 menit)
- ✅ Tidak perlu Google OAuth
- ✅ Tidak perlu Google Cloud Console
- ✅ Langsung pakai tanpa login
- ✅ Cocok untuk personal use

**Kekurangan:**
- ❌ Data tidak terpisah per user
- ❌ Siapa saja bisa akses & edit data
- ❌ Tidak ada user management
- ❌ Kurang aman untuk multi-user

**Cocok untuk:**
- Personal use (hanya Anda yang pakai)
- Testing & demo
- Data tidak sensitif
- Ingin cepat jalan

---

### 🔵 V2 - Secure (Dengan Login Google)

**Kelebihan:**
- ✅ Secure dengan Google OAuth
- ✅ Data terpisah per user
- ✅ Multi-user support
- ✅ User management otomatis
- ✅ Lebih profesional

**Kekurangan:**
- ❌ Setup lebih lama (~15 menit)
- ❌ Perlu Google OAuth setup
- ❌ Perlu Google Cloud Console
- ❌ Harus login setiap kali akses

**Cocok untuk:**
- Team/multi-user
- Data sensitif
- Production use
- Professional setup

---

## 🛠️ Cara Setup V1 (Simple)

### 1. Google Sheets Setup

Buat spreadsheet dengan **3 sheets** (tanpa sheet `users`):

**Sheet 1: ayam_induk**
```
id | kode | jenis_kelamin | ras | warna | tanggal_lahir
```

**Sheet 2: breeding**
```
id | pejantan_id | betina_id | tanggal_kawin | tanggal_menetas | jumlah_anakan
```

**Sheet 3: ayam_anakan**
```
id | breeding_id | kode | jenis_kelamin | warna | status
```

⚠️ **Catatan**: Tidak ada kolom `pemilik_email`

### 2. Google Apps Script Setup

1. Copy kode dari **`BACKEND_APPS_SCRIPT_V1.js`**
2. Paste ke Apps Script editor
3. Ganti `YOUR_SPREADSHEET_ID`
4. Deploy sebagai Web app (Anyone access)
5. Copy Web App URL

### 3. Frontend Setup

Edit `/app/frontend/.env.local`:
```
REACT_APP_SHEETS_API_URL=YOUR_WEB_APP_URL
```

Update `/app/frontend/src/index.js`:
```javascript
import App from './App-v1';  // ← Ganti ke V1
```

### 4. Run

```bash
cd /app/frontend
yarn start
```

**Selesai!** Langsung bisa CRUD tanpa login.

---

## 🔐 Cara Setup V2 (Secure)

### 1. Google Sheets Setup

Buat spreadsheet dengan **4 sheets**:

**Sheet 1: users**
```
id | email | display_name | photo_url | uid | created_at
```

**Sheet 2: ayam_induk**
```
id | kode | jenis_kelamin | ras | warna | tanggal_lahir | pemilik_email
```

**Sheet 3: breeding**
```
id | pejantan_id | betina_id | tanggal_kawin | tanggal_menetas | jumlah_anakan | pemilik_email
```

**Sheet 4: ayam_anakan**
```
id | breeding_id | kode | jenis_kelamin | warna | status | pemilik_email
```

⚠️ **Catatan**: Ada sheet `users` dan kolom `pemilik_email`

### 2. Google Apps Script Setup

1. Copy kode dari **`BACKEND_APPS_SCRIPT.js`** (V2)
2. Paste ke Apps Script editor
3. Ganti `YOUR_SPREADSHEET_ID`
4. Deploy sebagai Web app (Anyone access)
5. Copy Web App URL

### 3. Google OAuth Setup

1. Buka Google Cloud Console
2. Buat project baru
3. Enable Google+ API
4. Buat OAuth Client ID
5. Add authorized JavaScript origins
6. Copy Client ID

### 4. Frontend Setup

Edit `/app/frontend/.env.local`:
```
REACT_APP_SHEETS_API_URL=YOUR_WEB_APP_URL
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
```

**Jangan ubah** `/app/frontend/src/index.js` (default sudah V2)

### 5. Run

```bash
cd /app/frontend
yarn start
```

**Selesai!** Login dengan Google, data terpisah per user.

---

## 🔄 Upgrade dari V1 ke V2

Jika Anda mulai dengan V1 dan ingin upgrade ke V2:

### Step 1: Update Google Sheets

1. Tambah sheet baru: `users`
2. Tambah kolom `pemilik_email` ke semua sheet yang ada:
   - Sheet `ayam_induk`: tambah kolom `pemilik_email`
   - Sheet `breeding`: tambah kolom `pemilik_email`
   - Sheet `ayam_anakan`: tambah kolom `pemilik_email`

### Step 2: Migrasi Data (opsional)

Jika sudah ada data:
1. Buka Google Sheets
2. Isi kolom `pemilik_email` dengan email Anda
3. Atau biarkan kosong (data tidak akan muncul sampai di-claim)

### Step 3: Update Apps Script

1. Replace kode dengan `BACKEND_APPS_SCRIPT.js` (V2)
2. Deploy ulang

### Step 4: Setup Google OAuth

Ikuti panduan V2 untuk setup OAuth

### Step 5: Update Frontend

1. Edit `.env.local`, tambahkan `REACT_APP_GOOGLE_CLIENT_ID`
2. Update `index.js` untuk import `App.js` (V2)

### Step 6: Test

1. Login dengan Google
2. Verify data yang ada muncul (jika sudah isi `pemilik_email`)
3. Test CRUD

---

## 📊 Perbandingan Setup Time

| Task | V1 | V2 |
|------|----|----|---|
| Google Sheets | 3 menit | 3 menit |
| Apps Script | 2 menit | 2 menit |
| Google OAuth | - | 5 menit |
| Frontend Config | 1 menit | 2 menit |
| **TOTAL** | **~6 menit** | **~12 menit** |

---

## 🎯 Rekomendasi

### Pilih V1 jika:
- 👤 Hanya Anda yang pakai
- ⏱️ Ingin cepat jalan (< 10 menit)
- 🧪 Testing/prototype
- 🏚️ Data tidak sensitif

### Pilih V2 jika:
- 👥 Multi-user/team
- 🔒 Butuh security
- 💼 Production use
- 📦 Data terpisah per user

### Rekomendasi Saya:

**Start dengan V1** untuk:
- Belajar sistem
- Testing fitur
- Proof of concept

**Upgrade ke V2** saat:
- Mau share ke orang lain
- Data mulai penting
- Butuh tracking user

---

## ❓ FAQ

### Q: Bisa pakai V1 dulu, upgrade V2 nanti?
**A:** Ya! Tinggal follow panduan "Upgrade dari V1 ke V2" di atas.

### Q: V1 apa benar-benar tanpa login sama sekali?
**A:** Ya, langsung bisa CRUD. Tidak perlu Google OAuth.

### Q: Data V1 bisa di-migrate ke V2?
**A:** Ya, tinggal tambah kolom `pemilik_email` dan isi dengan email Anda.

### Q: V2 wajib pakai Google login?
**A:** Ya, untuk keamanan dan tracking user.

### Q: Bisakah V1 untuk 2-3 orang?
**A:** Bisa, tapi semua lihat & edit data yang sama. Tidak ada separation.

### Q: Performance V1 vs V2 beda?
**A:** Hampir sama, V2 sedikit lebih lambat karena ada auth checking.

---

## 📝 Summary

| Feature | V1 | V2 |
|---------|----|----|---|
| Login | ❌ Tidak perlu | ✅ Google OAuth |
| Setup Time | ~6 menit | ~12 menit |
| Multi-user | ⚠️ Shared data | ✅ Separated |
| Security | ❌ Basic | ✅ Secure |
| Data Ownership | ❌ Shared | ✅ Per user |
| Google Cloud Console | ❌ Tidak perlu | ✅ Perlu |
| Best for | Personal | Team/Production |
| Upgrade Path | ✅ Bisa ke V2 | - |

---

Pilih yang sesuai kebutuhan Anda! 🚀
