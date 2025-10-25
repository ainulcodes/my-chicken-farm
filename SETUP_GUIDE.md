# 📘 Panduan Setup - Website Breeding Ayam Super

## 🎯 Langkah-langkah Setup

### 1. Setup Google Sheets Database

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama: **Breeding Ayam Database**
3. Buat 4 sheet dengan struktur berikut:

#### Sheet 1: users
| id | email | display_name | photo_url | uid | created_at |
|-------|--------------|--------------|-----------|-----|------------|

#### Sheet 2: ayam_induk
| id | kode | jenis_kelamin | ras | warna | tanggal_lahir | pemilik_email |
|-------|------|---------------|-----|-------|---------------|---------------|

#### Sheet 3: breeding
| id | pejantan_id | betina_id | tanggal_kawin | tanggal_menetas | jumlah_anakan | pemilik_email |
|-------|-------------|-----------|---------------|-----------------|---------------|---------------|

#### Sheet 4: ayam_anakan
| id | breeding_id | kode | jenis_kelamin | warna | status | pemilik_email |
|-------|-------------|------|---------------|-------|--------|---------------|

### 2. Setup Google Apps Script (Backend API)

1. Di Google Sheets, klik **Extensions > Apps Script**
2. Hapus kode default, copy-paste kode dari file `BACKEND_APPS_SCRIPT.js`
3. Klik **Deploy > New Deployment**
4. Pilih type: **Web app**
5. Setting:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Klik **Deploy** dan copy **Web App URL**
7. URL ini akan digunakan sebagai `REACT_APP_SHEETS_API_URL`

### 3. Setup Google Sign-In

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih existing project
3. Enable **Google+ API**
4. Buka **Credentials > Create Credentials > OAuth client ID**
5. Application type: **Web application**
6. Authorized JavaScript origins:
   - `http://localhost:3000` (untuk development)
   - `https://your-username.github.io` (untuk production)
7. Copy **Client ID** yang dihasilkan

### 4. Setup Frontend Environment Variables

1. Buat file `/app/frontend/.env.local`:
```
REACT_APP_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

### 5. Install Dependencies & Run

```bash
# Frontend
cd /app/frontend
yarn install
yarn start
```

### 6. Deploy ke GitHub Pages

1. Push code ke GitHub repository
2. Update `.env.production` dengan production URLs
3. Build: `yarn build`
4. Deploy folder `build` ke GitHub Pages

## 🔐 Keamanan

- Google Apps Script akan memverifikasi token dari Google Sign-In
- Setiap request harus menyertakan Authorization header
- Data user di-filter berdasarkan email yang login

## 📱 Fitur

✅ Login dengan Google (tanpa password)
✅ CRUD Ayam Indukan
✅ CRUD Data Breeding
✅ CRUD Ayam Anakan
✅ Dashboard interaktif
✅ Mobile-friendly
✅ Data tersimpan di Google Sheets
