# 📚 Daftar File & Dokumentasi

Berikut adalah daftar lengkap file dan dokumentasi yang tersedia dalam project ini:

---

## 📖 Dokumentasi (Baca Ini!)

### 🚀 Untuk Pemula - Mulai Disini!
1. **`PANDUAN_CEPAT.md`** ⭐⭐⭐
   - Setup sistem dalam 10 menit
   - Step-by-step dengan estimasi waktu
   - Paling recommended untuk first-time setup

### 📘 Dokumentasi Lengkap
2. **`README.md`** ⭐⭐
   - Dokumentasi project lengkap
   - Fitur, teknologi, dan deployment guide
   - Troubleshooting umum

3. **`SETUP_GUIDE.md`**
   - Panduan setup detail
   - Penjelasan setiap langkah
   - Konfigurasi environment

### 💡 Memahami Sistem
4. **`CARA_KERJA_SISTEM.md`** ⭐
   - Arsitektur dan flow sistem
   - Diagram alur data
   - Penjelasan setiap komponen
   - Kapan pakai Google Sheets, kapan upgrade

### ❓ Bantuan & Troubleshooting
5. **`FAQ.md`** ⭐⭐⭐
   - Pertanyaan yang sering ditanya
   - Error common dan solusinya
   - Tips penggunaan
   - Wajib dibaca jika ada masalah!

### 📊 Contoh & Referensi
6. **`CONTOH_DATA.md`**
   - Contoh data untuk testing
   - Best practices data entry
   - Naming convention
   - Skenario breeding lengkap

### 📋 Daftar Ini
7. **`DAFTAR_FILE.md`** (file ini)
   - Index semua file dan dokumentasi
   - Navigasi cepat

---

## 💻 Source Code

### Backend (Google Apps Script)
- **`BACKEND_APPS_SCRIPT.js`** ⭐⭐⭐
  - Kode backend API
  - Copy-paste ke Google Apps Script
  - WAJIB ganti `YOUR_SPREADSHEET_ID`

### Frontend (React)

#### Core Files
- **`/frontend/src/App.js`**
  - Main application component
  - Routing dan authentication wrapper

- **`/frontend/src/App.css`**
  - Global styles dan animations
  - Custom fonts

- **`/frontend/src/index.js`**
  - Entry point aplikasi

- **`/frontend/src/index.css`**
  - TailwindCSS imports

#### Authentication
- **`/frontend/src/contexts/AuthContext.js`** ⭐
  - Manage user authentication state
  - Login/logout functions
  - Persist user data

#### API Service
- **`/frontend/src/services/api.js`** ⭐
  - Wrapper untuk semua API calls
  - Integration dengan Google Sheets API
  - CRUD operations

#### Components
- **`/frontend/src/components/Login.js`**
  - Login page dengan Google OAuth
  - Google Sign-In integration

- **`/frontend/src/components/Dashboard.js`**
  - Main dashboard
  - Module navigation
  - User profile header

#### Modules (CRUD)
- **`/frontend/src/components/modules/AyamIndukModule.js`** ⭐
  - CRUD ayam indukan
  - List, add, edit, delete
  - Filter jantan/betina

- **`/frontend/src/components/modules/BreedingModule.js`** ⭐
  - CRUD data breeding
  - Pilih pejantan & betina
  - Track jumlah anakan

- **`/frontend/src/components/modules/AyamAnakanModule.js`** ⭐
  - CRUD ayam anakan
  - Link ke breeding parent
  - Filter by breeding
  - Status tracking

#### UI Components (Shadcn)
- **`/frontend/src/components/ui/`**
  - Pre-built UI components
  - Button, Card, Dialog, Input, Select, dll
  - Fully styled dengan TailwindCSS

---

## ⚙️ Configuration Files

### Environment
- **`/frontend/.env.local`** ⚙️⚙️⚙️
  - WAJIB DIISI!
  - `REACT_APP_SHEETS_API_URL` (dari Google Apps Script)
  - `REACT_APP_GOOGLE_CLIENT_ID` (dari Google Cloud Console)

- **`/frontend/.env`**
  - Environment variables untuk Emergent
  - Jangan edit!

- **`/frontend/.gitignore`**
  - File yang di-ignore git
  - Termasuk .env.local (untuk keamanan)

### Build & Dependencies
- **`/frontend/package.json`**
  - NPM dependencies
  - Scripts untuk build & deploy
  - Project metadata

- **`/frontend/tailwind.config.js`**
  - TailwindCSS configuration
  - Custom colors & themes

- **`/frontend/postcss.config.js`**
  - PostCSS configuration untuk Tailwind

### Backend (Python - Not Used for This Project)
- **`/backend/server.py`**
  - FastAPI server (tidak digunakan untuk Google Sheets version)
  - Template untuk upgrade future

- **`/backend/requirements.txt`**
  - Python dependencies
  - Tidak diperlukan untuk versi ini

---

## 📁 Folder Structure

```
/app/
├── 📖 Dokumentasi
│   ├── README.md
│   ├── PANDUAN_CEPAT.md ⭐
│   ├── SETUP_GUIDE.md
│   ├── CARA_KERJA_SISTEM.md
│   ├── FAQ.md ⭐
│   ├── CONTOH_DATA.md
│   └── DAFTAR_FILE.md (ini)
│
├── 💾 Backend
│   ├── BACKEND_APPS_SCRIPT.js ⭐⭐⭐
│   ├── server.py (not used)
│   ├── requirements.txt (not used)
│   └── .env (not used)
│
├── 🎨 Frontend
│   ├── src/
│   │   ├── App.js ⭐
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── contexts/
│   │   │   └── AuthContext.js ⭐
│   │   ├── services/
│   │   │   └── api.js ⭐
│   │   └── components/
│   │       ├── Login.js
│   │       ├── Dashboard.js
│   │       ├── modules/
│   │       │   ├── AyamIndukModule.js ⭐
│   │       │   ├── BreedingModule.js ⭐
│   │       │   └── AyamAnakanModule.js ⭐
│   │       └── ui/ (Shadcn components)
│   │
│   ├── .env.local ⚙️⚙️⚙️ (WAJIB ISI!)
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── 🧪 Tests & Scripts
    ├── tests/ (empty)
    └── scripts/ (empty)
```

---

## 🎯 Quick Navigation

### Baru Mulai?
1. Baca **`PANDUAN_CEPAT.md`** (10 menit)
2. Setup Google Sheets, Apps Script, OAuth
3. Isi **`.env.local`**
4. Run aplikasi!

### Ada Masalah?
1. Cek **`FAQ.md`** dulu
2. Baca error message di browser console (F12)
3. Validasi setup di **`PANDUAN_CEPAT.md`**

### Ingin Modify Code?
1. Pahami arsitektur di **`CARA_KERJA_SISTEM.md`**
2. Lihat contoh CRUD di `/components/modules/`
3. Check **`api.js`** untuk API integration

### Ingin Deploy?
1. Baca section "Deploy" di **`README.md`**
2. Setup production `.env`
3. Update Google OAuth authorized origins

### Butuh Inspirasi Data?
1. Lihat **`CONTOH_DATA.md`**
2. Copy contoh ke Google Sheets
3. Adjust sesuai kebutuhan

---

## ⭐ Priority Reading

### Level 1 - WAJIB BACA (10-15 menit)
1. **`PANDUAN_CEPAT.md`** - Setup sistem
2. **`FAQ.md`** - Troubleshooting common issues

### Level 2 - Sangat Recommended (15-20 menit)
3. **`README.md`** - Overview lengkap
4. **`CARA_KERJA_SISTEM.md`** - Understand architecture

### Level 3 - Optional (bila perlu)
5. **`SETUP_GUIDE.md`** - Detail setup steps
6. **`CONTOH_DATA.md`** - Sample data & best practices

---

## 🔧 File yang Perlu Diedit

### WAJIB EDIT
1. **`BACKEND_APPS_SCRIPT.js`**
   - Line 15: Ganti `YOUR_SPREADSHEET_ID`

2. **`/frontend/.env.local`**
   - `REACT_APP_SHEETS_API_URL`: Paste Web App URL
   - `REACT_APP_GOOGLE_CLIENT_ID`: Paste Client ID

### OPTIONAL EDIT
3. **`/frontend/package.json`** (jika deploy ke GitHub Pages)
   - Tambah `homepage` field
   - Tambah `predeploy` & `deploy` scripts

4. **Component files** (jika customize)
   - `/components/modules/*.js` - CRUD logic
   - `/App.css` - Styling

---

## 🚫 Jangan Edit!

- `/frontend/.env` - Config Emergent
- `/frontend/src/components/ui/*` - Shadcn components
- `/backend/server.py` - Template, not used
- Config files (tailwind, postcss) - Unless you know what you're doing

---

## 📞 Need Help?

1. Baca dokumentasi yang relevan (lihat Priority Reading)
2. Check FAQ untuk error yang sama
3. Validate setup steps
4. Check browser console untuk detail error
5. Google error message (often helpful!)

---

Semoga membantu! Sistem ini dirancang untuk mudah dipahami dan di-maintain. Happy coding! 🐔💻✨
