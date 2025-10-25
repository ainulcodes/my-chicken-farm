# ✅ Checklist Setup - Breeding Ayam Super

Gunakan checklist ini untuk memastikan setup Anda lengkap dan benar!

---

## 📋 Pre-Setup Checklist

Sebelum mulai, pastikan Anda punya:

- [ ] Akun Google (Gmail)
- [ ] Akses ke Google Sheets
- [ ] Akses ke Google Cloud Console
- [ ] Browser modern (Chrome, Firefox, Safari, Edge)
- [ ] Koneksi internet stabil

---

## 1️⃣ Google Sheets Setup

- [ ] Buka https://sheets.google.com
- [ ] Buat spreadsheet baru
- [ ] Rename jadi "Breeding Ayam Database"
- [ ] Buat sheet: `users`
- [ ] Buat sheet: `ayam_induk`
- [ ] Buat sheet: `breeding`
- [ ] Buat sheet: `ayam_anakan`

### Headers untuk setiap sheet:

#### Sheet: users
- [ ] Header row: `id | email | display_name | photo_url | uid | created_at`

#### Sheet: ayam_induk
- [ ] Header row: `id | kode | jenis_kelamin | ras | warna | tanggal_lahir | pemilik_email`

#### Sheet: breeding
- [ ] Header row: `id | pejantan_id | betina_id | tanggal_kawin | tanggal_menetas | jumlah_anakan | pemilik_email`

#### Sheet: ayam_anakan
- [ ] Header row: `id | breeding_id | kode | jenis_kelamin | warna | status | pemilik_email`

### Spreadsheet ID
- [ ] Copy Spreadsheet ID dari URL
- [ ] Format: `https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit`
- [ ] Simpan ID ini (akan digunakan di Apps Script)

**Spreadsheet ID Saya:** `_________________________`

---

## 2️⃣ Google Apps Script Setup

- [ ] Di Google Sheets, klik **Extensions > Apps Script**
- [ ] Hapus semua kode default
- [ ] Copy kode dari file `/app/BACKEND_APPS_SCRIPT.js`
- [ ] Paste ke Apps Script editor
- [ ] **PENTING**: Edit line 15, ganti `YOUR_SPREADSHEET_ID` dengan ID Anda
- [ ] Klik **Save** (icon 💾)
- [ ] Klik **Deploy > New deployment**
- [ ] Klik icon gear ⚙️, pilih **Web app**
- [ ] Setting Execute as: **Me**
- [ ] Setting Who has access: **Anyone**
- [ ] Klik **Deploy**
- [ ] Authorize (klik Review Permissions, Allow)
- [ ] Copy **Web App URL** yang muncul
- [ ] Simpan URL ini (akan digunakan di frontend)

**Web App URL Saya:** `_________________________`

### Verifikasi Apps Script:
- [ ] URL format: `https://script.google.com/macros/s/.../exec`
- [ ] Test dengan buka URL di browser → harus return JSON
- [ ] Cek tidak ada typo di Spreadsheet ID

---

## 3️⃣ Google OAuth Setup

- [ ] Buka https://console.cloud.google.com
- [ ] Klik **Select a project**
- [ ] Klik **New Project**
- [ ] Project name: "Breeding Ayam App"
- [ ] Klik **Create**
- [ ] Tunggu project dibuat
- [ ] Select project yang baru dibuat

### Enable API:
- [ ] Sidebar: **APIs & Services > Library**
- [ ] Search: "Google+ API"
- [ ] Klik hasil pertama
- [ ] Klik **Enable**
- [ ] Tunggu hingga enabled

### Configure Consent Screen:
- [ ] Sidebar: **APIs & Services > OAuth consent screen**
- [ ] User Type: **External**
- [ ] Klik **Create**
- [ ] App name: "Breeding Ayam"
- [ ] User support email: pilih email Anda
- [ ] Developer contact information: isi email Anda
- [ ] Klik **Save and Continue**
- [ ] Scopes: skip, klik **Save and Continue**
- [ ] Test users: skip, klik **Save and Continue**
- [ ] Summary: klik **Back to Dashboard**

### Create OAuth Credentials:
- [ ] Sidebar: **Credentials**
- [ ] Klik **Create Credentials > OAuth client ID**
- [ ] Application type: **Web application**
- [ ] Name: "Breeding Ayam Web Client"
- [ ] Authorized JavaScript origins:
  - [ ] Klik **Add URI**
  - [ ] Add: `http://localhost:3000`
  - [ ] (Untuk production, add GitHub Pages URL nanti)
- [ ] Klik **Create**
- [ ] Copy **Client ID** yang muncul
- [ ] Simpan Client ID (akan digunakan di frontend)

**Client ID Saya:** `_________________________`

### Verifikasi OAuth:
- [ ] Client ID format: `xxxxx.apps.googleusercontent.com`
- [ ] Authorized origins ada `http://localhost:3000`

---

## 4️⃣ Frontend Configuration

- [ ] Buka file `/app/frontend/.env.local`
- [ ] Paste Web App URL ke `REACT_APP_SHEETS_API_URL`
- [ ] Paste Client ID ke `REACT_APP_GOOGLE_CLIENT_ID`
- [ ] Save file

### Verifikasi .env.local:
```
REACT_APP_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

- [ ] URL lengkap (dimulai dengan https://)
- [ ] Client ID lengkap (berakhir dengan .apps.googleusercontent.com)
- [ ] Tidak ada extra spaces atau quotes

---

## 5️⃣ Run Application

### Jika di Local Machine:
- [ ] Buka terminal
- [ ] `cd /app/frontend`
- [ ] `yarn install` (jika belum)
- [ ] `yarn start`
- [ ] Tunggu compilation selesai
- [ ] Browser otomatis buka atau akses `http://localhost:3000`

### Verifikasi:
- [ ] Aplikasi terbuka tanpa error
- [ ] Login page tampil dengan benar
- [ ] Button "Masuk dengan Google" tampil

---

## 6️⃣ Test Login & Functionality

### Login Test:
- [ ] Klik button "Masuk dengan Google"
- [ ] Popup Google login muncul
- [ ] Pilih akun Google
- [ ] Login berhasil, redirect ke Dashboard
- [ ] User info tampil di header (nama & email)
- [ ] Cek Google Sheets → sheet `users` ada data baru

### CRUD Test - Ayam Indukan:
- [ ] Klik module "Ayam Indukan"
- [ ] Klik "+ Tambah Indukan"
- [ ] Isi form lengkap
- [ ] Klik Simpan
- [ ] Toast success muncul
- [ ] Data tampil di list
- [ ] Cek Google Sheets → sheet `ayam_induk` ada data baru
- [ ] Test Edit: ubah data, save, verify
- [ ] Test Delete: hapus data (use caution!), verify

### CRUD Test - Breeding:
- [ ] Pastikan ada minimal 1 pejantan (jantan) dan 1 betina
- [ ] Klik module "Breeding"
- [ ] Klik "+ Tambah Breeding"
- [ ] Pilih pejantan dan betina
- [ ] Isi tanggal kawin dan menetas
- [ ] Klik Simpan
- [ ] Verify data muncul
- [ ] Cek Google Sheets → sheet `breeding` ada data baru

### CRUD Test - Ayam Anakan:
- [ ] Pastikan ada data breeding
- [ ] Klik module "Ayam Anakan"
- [ ] Klik "+ Tambah Anakan"
- [ ] Pilih breeding
- [ ] Isi form lengkap
- [ ] Klik Simpan
- [ ] Verify data muncul
- [ ] Cek Google Sheets → sheet `ayam_anakan` ada data baru
- [ ] Test filter breeding

### Logout Test:
- [ ] Klik button "Keluar"
- [ ] Redirect ke login page
- [ ] Verify user info hilang

---

## 🐛 Troubleshooting Checklist

### Google Sign-In tidak muncul?
- [ ] Cek `.env.local` → Client ID benar?
- [ ] Cek browser console (F12) → ada error?
- [ ] Refresh browser
- [ ] Clear cache & cookies
- [ ] Try different browser

### Data tidak tersimpan?
- [ ] Cek `.env.local` → Web App URL benar?
- [ ] Cek Apps Script → Spreadsheet ID benar?
- [ ] Cek Google Sheets → sheet names match (huruf kecil!)?
- [ ] Cek Google Sheets → headers correct?
- [ ] Cek Apps Script deployed dengan "Anyone" access?
- [ ] Cek browser console untuk error message

### Login berhasil tapi data tidak muncul?
- [ ] Refresh browser (F5)
- [ ] Logout dan login lagi
- [ ] Cek browser console untuk API errors
- [ ] Cek Google Sheets → data ada tapi pemilik_email berbeda?
- [ ] Test API URL langsung di browser

### Dropdown kosong (pejantan/betina)?
- [ ] Cek ada data ayam indukan?
- [ ] Cek jenis kelamin ayam (harus exact: "Jantan" atau "Betina")
- [ ] Cek pemilik_email match dengan email login

---

## 🎉 Success Criteria

Anda berhasil setup jika:

- ✅ Login dengan Google work
- ✅ Bisa tambah ayam indukan
- ✅ Bisa tambah breeding
- ✅ Bisa tambah ayam anakan
- ✅ Data tersimpan di Google Sheets
- ✅ Edit & delete work
- ✅ Logout work

**SELAMAT! Sistem Anda siap digunakan!** 🎊

---

## 📌 Important Notes to Save

Simpan informasi penting ini:

```
SPREADSHEET ID: ___________________________

WEB APP URL: ___________________________

GOOGLE CLIENT ID: ___________________________

GOOGLE SHEETS URL: ___________________________

APPS SCRIPT URL: ___________________________
```

---

## 🚀 Next Steps (Optional)

Setelah setup berhasil, Anda bisa:

- [ ] Input data real ayam Anda
- [ ] Customize tampilan (colors, fonts)
- [ ] Deploy ke production (GitHub Pages)
- [ ] Setup authorized origins untuk production URL
- [ ] Share aplikasi dengan team
- [ ] Explore advanced features

---

## 📚 Reference Links

Quick access untuk services:

- Google Sheets: https://sheets.google.com
- Google Apps Script: Extensions > Apps Script (dari Sheets)
- Google Cloud Console: https://console.cloud.google.com
- Frontend Code: `/app/frontend/src/`
- Backend Code: `/app/BACKEND_APPS_SCRIPT.js`
- Documentation: `/app/README.md`, `/app/FAQ.md`

---

**Print checklist ini dan gunakan saat setup untuk memastikan tidak ada langkah yang terlewat!** ✓

Good luck! 🐔💪
