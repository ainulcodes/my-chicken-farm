# ❓ FAQ - Breeding Ayam Aduan

## Umum

### Q: Apakah sistem ini gratis?
**A:** Ya, 100% gratis! Anda hanya perlu:
- Akun Google (gratis)
- Google Sheets (gratis)
- Google Apps Script (gratis)
- Google OAuth (gratis)
- Hosting di GitHub Pages (gratis)

### Q: Apakah data saya aman?
**A:** Ya, data Anda tersimpan di Google Sheets milik Anda sendiri. Hanya Anda yang punya akses penuh. Sistem menggunakan Google OAuth untuk authentication.

### Q: Berapa banyak data yang bisa disimpan?
**A:** Google Sheets support hingga:
- 10 juta cells per spreadsheet
- ~200,000 rows (dengan 50 columns)
Untuk breeding ayam, ini sudah sangat cukup!

### Q: Apakah bisa dipakai ramai-ramai (team)?
**A:** Bisa, tapi dengan catatan:
- Performance optimal untuk 1-5 users
- Tidak real-time (perlu refresh manual)
- Cocok untuk personal atau small team

---

## Setup & Konfigurasi

### Q: Saya tidak punya Spreadsheet ID, bagaimana cara mendapatkannya?
**A:** 
1. Buka Google Sheets Anda di browser
2. Lihat URL di address bar
3. Format URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_DISINI/edit`
4. Copy bagian antara `/d/` dan `/edit`
5. Contoh: URL = `https://docs.google.com/spreadsheets/d/1ABC-xyz123_DEF/edit`
6. ID = `1ABC-xyz123_DEF`

### Q: Web App URL dari mana?
**A:**
1. Buka Google Sheets > Extensions > Apps Script
2. Paste kode dari file `BACKEND_APPS_SCRIPT.js`
3. Klik Deploy > New deployment
4. Pilih Web app
5. Setting: Execute as Me, Who has access: Anyone
6. Klik Deploy
7. Copy URL yang muncul (format: `https://script.google.com/macros/s/.../exec`)

### Q: Google Client ID itu apa?
**A:**
Client ID adalah identitas aplikasi Anda untuk Google OAuth. Cara dapat:
1. Buka https://console.cloud.google.com
2. Buat project baru
3. Enable Google+ API
4. Credentials > Create > OAuth client ID
5. Type: Web application
6. Authorized JavaScript origins: `http://localhost:3000`
7. Copy Client ID yang muncul

### Q: Error "Configure Consent Screen" saat buat OAuth?
**A:**
1. Klik link "Configure Consent Screen"
2. User Type: External, klik Create
3. Isi App name, email, dan developer contact
4. Klik Save and Continue sampai selesai
5. Kembali ke Credentials dan buat OAuth client ID lagi

---

## Error & Troubleshooting

### Q: Google Sign-In button tidak muncul?
**A:** Kemungkinan penyebab:
1. **Client ID salah** - Cek file `.env.local`, pastikan `REACT_APP_GOOGLE_CLIENT_ID` benar
2. **Script belum load** - Refresh browser, tunggu beberapa detik
3. **Browser block** - Cek browser console (F12), mungkin ada error
4. **Authorized origins** - Pastikan `http://localhost:3000` ada di Google Cloud Console

### Q: Error "Failed to load data" atau data kosong?
**A:** Kemungkinan penyebab:
1. **Apps Script belum deploy** - Pastikan sudah deploy sebagai Web app
2. **URL salah** - Cek `REACT_APP_SHEETS_API_URL` di `.env.local`
3. **Spreadsheet ID salah** - Cek di Apps Script, pastikan ID benar
4. **Sheet names salah** - Pastikan nama sheet: `users`, `ayam_induk`, `breeding`, `ayam_anakan` (huruf kecil semua!)
5. **Headers tidak match** - Pastikan column headers di row 1 sesuai dokumentasi

### Q: Data tersimpan tapi tidak muncul di aplikasi?
**A:**
1. Refresh browser (F5)
2. Cek Google Sheets, apakah data benar-benar tersimpan?
3. Cek kolom `pemilik_email` - pastikan match dengan email login Anda
4. Buka browser console (F12), cek ada error?

### Q: Error "Script function not found: doGet" atau "doPost"?
**A:**
1. Pastikan kode Apps Script sudah di-save (klik Save)
2. Deploy ulang: Deploy > Manage deployments > Edit > Deploy
3. Pastikan kode lengkap, tidak ada yang terpotong

### Q: Login berhasil tapi langsung redirect ke login lagi?
**A:**
1. Cek browser console (F12) untuk error
2. Clear localStorage: Console > `localStorage.clear()` > Enter
3. Refresh browser dan login ulang
4. Cek network tab, apakah API call ke Apps Script berhasil?

---

## Penggunaan

### Q: Bagaimana cara menambah ayam indukan?
**A:**
1. Login ke aplikasi
2. Pastikan module "Ayam Indukan" aktif (klik card Ayam Indukan)
3. Klik tombol "+ Tambah Indukan"
4. Isi form: Kode, Jenis Kelamin, Ras, Warna, Tanggal Lahir
5. Klik Simpan
6. Data akan muncul di list dan tersimpan di Google Sheets

### Q: Bagaimana cara membuat data breeding?
**A:**
Pastikan sudah ada minimal 1 ayam jantan dan 1 betina:
1. Tambah ayam indukan jantan (jika belum ada)
2. Tambah ayam indukan betina (jika belum ada)
3. Klik module "Breeding"
4. Klik "+ Tambah Breeding"
5. Pilih Pejantan (jantan) dan Indukan Betina
6. Isi tanggal kawin dan tanggal menetas
7. Klik Simpan

### Q: Kenapa dropdown Pejantan/Betina kosong?
**A:**
Dropdown akan kosong jika:
1. Belum ada data ayam indukan
2. Tidak ada ayam dengan jenis kelamin yang sesuai
   - Pejantan: butuh ayam dengan jenis kelamin "Jantan"
   - Betina: butuh ayam dengan jenis kelamin "Betina"

Solusi: Tambah ayam indukan dulu di module "Ayam Indukan"

### Q: Bagaimana cara menambah ayam anakan?
**A:**
1. Pastikan sudah ada data breeding
2. Klik module "Ayam Anakan"
3. Klik "+ Tambah Anakan"
4. Pilih breeding yang sesuai
5. Isi kode ayam, jenis kelamin, warna, dan status
6. Klik Simpan

### Q: Apakah bisa filter anakan berdasarkan breeding tertentu?
**A:** Ya! Di module Ayam Anakan, gunakan dropdown "Filter Breeding" di pojok kanan atas untuk menampilkan anakan dari breeding tertentu saja.

---

## Data Management

### Q: Bagaimana cara edit data?
**A:**
1. Cari data yang ingin diedit di list
2. Klik tombol "Edit" pada card data tersebut
3. Modal akan terbuka dengan data existing
4. Ubah data yang diperlukan
5. Klik Simpan

### Q: Bagaimana cara hapus data?
**A:**
1. Cari data yang ingin dihapus
2. Klik tombol "Hapus" (merah)
3. Konfirmasi dialog akan muncul
4. Klik OK untuk menghapus

⚠️ **Perhatian**: Data yang dihapus tidak bisa dikembalikan!

### Q: Apakah bisa export data ke Excel?
**A:** Ya, sangat mudah!
1. Buka Google Sheets Anda
2. File > Download > Microsoft Excel (.xlsx)
atau
2. File > Download > CSV

### Q: Apakah bisa import data dari Excel?
**A:** Ya:
1. Buka Google Sheets
2. File > Import
3. Pilih file Excel Anda
4. Pilih sheet dan import
5. Pastikan format data match dengan structure yang ada

### Q: Bagaimana cara backup data?
**A:** Google Sheets otomatis backup, tapi Anda bisa:
1. File > Make a copy (duplicate spreadsheet)
2. File > Download (download sebagai backup offline)
3. File > Version history (lihat dan restore versi sebelumnya)

---

## Performance & Limits

### Q: Apakah ada batasan jumlah data?
**A:**
- Google Sheets: ~200,000 rows
- Apps Script: 6 menit execution time per request
- Praktis: Optimal untuk < 5,000 records total

### Q: Aplikasi terasa lambat?
**A:** Bisa jadi karena:
1. Data sudah terlalu banyak (>10,000 rows)
2. Internet lambat
3. Google Sheets sedang loading
Solusi:
- Archive old data ke spreadsheet terpisah
- Optimize: hapus data yang tidak perlu
- Upgrade ke database proper (MongoDB, Firebase)

### Q: Ada limit request ke Google Apps Script?
**A:** Ya, Google punya quota:
- 90 minutes execution time per day
- 20,000 URL Fetch calls per day
- Untuk personal use, ini sangat cukup!

---

## Deployment

### Q: Bagaimana cara deploy ke internet?
**A:** Cara termudah: GitHub Pages
1. Push code ke GitHub repository
2. Buat `.env.production` dengan production URLs
3. Install gh-pages: `yarn add -D gh-pages`
4. Update `package.json`:
```json
{
  "homepage": "https://username.github.io/repo-name",
  "scripts": {
    "deploy": "gh-pages -d build"
  }
}
```
5. Run: `yarn build && yarn deploy`
6. Settings > Pages > Source: gh-pages branch
7. Update Authorized JavaScript origins di Google Cloud Console dengan URL GitHub Pages

### Q: Apakah bisa deploy di Vercel/Netlify?
**A:** Ya! Prosesnya mirip:
1. Connect repository ke Vercel/Netlify
2. Set environment variables di dashboard
3. Deploy

### Q: Setelah deploy, Google login tidak work?
**A:**
1. Buka Google Cloud Console
2. Credentials > OAuth Client ID
3. Edit authorized JavaScript origins
4. Tambahkan production URL (e.g., `https://username.github.io`)
5. Save

---

## Development

### Q: Bagaimana cara menambah field baru?
**A:**
1. **Update Google Sheets**: Tambah column baru di sheet
2. **Update Apps Script**: Tidak perlu update, otomatis handle
3. **Update Frontend**: 
   - Tambah field di formData state
   - Tambah input di form JSX
   - Tambah display di card

### Q: Bagaimana cara menambah module baru?
**A:**
1. Buat sheet baru di Google Sheets dengan structure yang diperlukan
2. Update Apps Script: tambah handler untuk GET/POST
3. Buat file baru di `/frontend/src/components/modules/`
4. Import dan gunakan di Dashboard.js

### Q: Apakah bisa menggunakan database lain selain Google Sheets?
**A:** Ya! Anda perlu:
1. Setup backend API (Express.js, FastAPI, etc.)
2. Replace `api.js` dengan API calls ke backend Anda
3. Update AuthContext jika perlu
4. Frontend code structure sama

---

## Lain-lain

### Q: Apakah ada versi mobile app?
**A:** Belum ada, tapi web app ini sudah mobile-friendly (responsive design). Bisa diakses dari browser mobile dengan baik.

### Q: Bagaimana cara menambah user lain?
**A:** Setiap user cukup:
1. Akses URL aplikasi
2. Login dengan Google account mereka
3. Data mereka akan terpisah otomatis

### Q: Apakah bisa multi-language?
**A:** Saat ini hanya Bahasa Indonesia. Untuk tambah bahasa lain, perlu implement i18n (internationalization) library seperti react-i18next.

### Q: Source code bisa dimodifikasi?
**A:** Ya, 100%! Code ini open dan bisa dimodifikasi sesuai kebutuhan. Silakan customize tampilan, field, atau fitur apapun.

---

## Kontak & Support

Jika masih ada pertanyaan yang tidak terjawab di FAQ ini, silakan:
1. Baca dokumentasi lengkap di `/app/README.md`
2. Cek panduan setup di `/app/PANDUAN_CEPAT.md`
3. Pelajari cara kerja sistem di `/app/CARA_KERJA_SISTEM.md`

Selamat menggunakan sistem Breeding Ayam Aduan! 🐔✨
