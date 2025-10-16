# 🐓 Website Breeding Ayam Aduan

Sistem manajemen breeding ayam aduan profesional dengan Google Sheets sebagai database.

## ✨ Fitur Utama

- ✅ **Login dengan Google** - Tanpa password, aman dan mudah
- ✅ **CRUD Ayam Indukan** - Kelola data pejantan dan betina
- ✅ **CRUD Breeding** - Catat data perkawinan dan hasil
- ✅ **CRUD Ayam Anakan** - Pantau perkembangan anakan
- ✅ **Dashboard Interaktif** - UI modern dan mobile-friendly
- ✅ **Database Google Sheets** - Gratis dan mudah diakses
- ✅ **Deploy ke GitHub Pages** - Hosting gratis

## 🚀 Cara Setup

### 1. Setup Google Sheets Database

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama: **Breeding Ayam Database**
3. Buat 4 sheet dengan struktur berikut:

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

4. Copy Spreadsheet ID dari URL (bagian setelah `/d/`)
   - Contoh: `https://docs.google.com/spreadsheets/d/1ABC123xyz/edit`
   - ID: `1ABC123xyz`

### 2. Setup Google Apps Script (Backend API)

1. Di Google Sheets, klik **Extensions > Apps Script**
2. Hapus kode default
3. Copy-paste kode dari file `/app/BACKEND_APPS_SCRIPT.js`
4. Ganti `YOUR_SPREADSHEET_ID` dengan ID spreadsheet Anda (di baris 6)
5. Klik **Deploy > New Deployment**
6. Pilih type: **Web app**
7. Setting:
   - **Execute as**: Me
   - **Who has access**: Anyone
8. Klik **Deploy**
9. Copy **Web App URL** yang muncul
   - Contoh: `https://script.google.com/macros/s/AKfycby.../exec`

### 3. Setup Google OAuth (Login dengan Google)

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih existing project
3. Enable **Google+ API**:
   - Menu: APIs & Services > Library
   - Cari "Google+ API" dan klik Enable
4. Buat OAuth Credentials:
   - Menu: APIs & Services > Credentials
   - Click **Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - Name: "Breeding Ayam App"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (untuk development)
     - `https://your-username.github.io` (untuk production, ganti dengan username GitHub Anda)
   - **Authorized redirect URIs**: (kosongkan)
5. Click **Create**
6. Copy **Client ID** yang muncul
   - Contoh: `123456789-abc123.apps.googleusercontent.com`

### 4. Konfigurasi Environment Variables

1. Edit file `/app/frontend/.env.local`:

```env
# Paste Web App URL dari Google Apps Script
REACT_APP_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Paste Client ID dari Google Cloud Console
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

### 5. Install Dependencies & Run

```bash
cd /app/frontend
yarn install
yarn start
```

Aplikasi akan berjalan di `http://localhost:3000`

### 6. Deploy ke GitHub Pages (Opsional)

1. Push code ke GitHub repository

2. Buat file `.env.production` dengan production URLs:

```env
REACT_APP_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

3. Update `package.json`, tambahkan:

```json
{
  "homepage": "https://your-username.github.io/repo-name",
  "scripts": {
    "predeploy": "yarn build",
    "deploy": "gh-pages -d build"
  }
}
```

4. Install gh-pages:

```bash
yarn add -D gh-pages
```

5. Deploy:

```bash
yarn deploy
```

6. Setting GitHub Pages:
   - Repository Settings > Pages
   - Source: Deploy from branch
   - Branch: gh-pages / root

## 🎨 Teknologi

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Authentication**: Google Sign-In
- **Hosting**: GitHub Pages (static)

## 📱 Screenshot

### Login Page
- Login sederhana dengan Google OAuth
- Design modern dan profesional

### Dashboard
- 3 Module utama: Ayam Indukan, Breeding, Ayam Anakan
- Card-based navigation
- User profile di header

### CRUD Operations
- Modal dialog untuk tambah/edit data
- Validation dan error handling
- Toast notifications

## 🔒 Keamanan

- ✅ Authentication via Google OAuth
- ✅ Data user-specific (filtered by email)
- ✅ Google Apps Script handles authorization
- ✅ No backend server needed

## 🐛 Troubleshooting

### Error: "Failed to load data"
- Pastikan Google Apps Script sudah di-deploy dengan setting "Anyone" access
- Cek URL di `.env.local` sudah benar
- Cek Spreadsheet ID sudah benar di Apps Script

### Error: "Google Sign-In not working"
- Pastikan Client ID sudah benar di `.env.local`
- Cek Authorized JavaScript origins di Google Cloud Console
- Pastikan Google+ API sudah enabled

### Data tidak tersimpan
- Cek console browser untuk error messages
- Pastikan sheet names di Google Sheets match dengan kode: `users`, `ayam_induk`, `breeding`, `ayam_anakan`
- Cek column headers sudah sesuai struktur

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buka issue di GitHub repository.

## 📄 License

MIT License - Bebas digunakan untuk proyek pribadi maupun komersial.
