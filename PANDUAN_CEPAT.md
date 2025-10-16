# \ud83d\ude80 Panduan Cepat - Setup dalam 10 Menit

## \ud83d\udccc Step 1: Buat Google Sheets (2 menit)

1. Buka https://sheets.google.com
2. Klik **Blank** untuk membuat spreadsheet baru
3. Rename menjadi: **Breeding Ayam Database**
4. Buat 4 sheet dengan cara klik **+** di bagian bawah:
   - `users`
   - `ayam_induk`
   - `breeding`
   - `ayam_anakan`

5. Untuk setiap sheet, isi baris pertama (header) dengan kolom berikut:

### Sheet: users
```
id    email    display_name    photo_url    uid    created_at
```

### Sheet: ayam_induk
```
id    kode    jenis_kelamin    ras    warna    tanggal_lahir    pemilik_email
```

### Sheet: breeding
```
id    pejantan_id    betina_id    tanggal_kawin    tanggal_menetas    jumlah_anakan    pemilik_email
```

### Sheet: ayam_anakan
```
id    breeding_id    kode    jenis_kelamin    warna    status    pemilik_email
```

6. Copy **Spreadsheet ID** dari URL browser (bagian antara `/d/` dan `/edit`)

---

## \ud83d\udcbb Step 2: Deploy Google Apps Script (3 menit)

1. Di Google Sheets, klik menu **Extensions > Apps Script**
2. Hapus semua kode yang ada
3. Copy isi file `/app/BACKEND_APPS_SCRIPT.js` dan paste ke editor
4. **PENTING**: Di baris 6, ganti `YOUR_SPREADSHEET_ID` dengan ID yang Anda copy tadi
5. Klik **Save** (icon disket)
6. Klik **Deploy > New deployment**
7. Klik icon **gear** ⚙️, pilih **Web app**
8. Setting:
   - Execute as: **Me (your-email@gmail.com)**
   - Who has access: **Anyone**
9. Klik **Deploy**
10. Authorize akses (klik Review Permissions > pilih akun > Allow)
11. Copy **Web App URL** yang muncul dan simpan

---

## \ud83d\udd11 Step 3: Setup Google OAuth (3 menit)

1. Buka https://console.cloud.google.com
2. Klik **Select a project > New Project**
3. Nama project: **Breeding Ayam App**, klik **Create**
4. Tunggu project dibuat, lalu klik **Select Project**
5. Di sidebar, klik **APIs & Services > Library**
6. Cari **Google+ API**, klik, lalu klik **Enable**
7. Di sidebar, klik **Credentials**
8. Klik **Create Credentials > OAuth client ID**
9. Jika muncul "Configure Consent Screen":
   - User Type: **External**, klik **Create**
   - App name: **Breeding Ayam**
   - User support email: pilih email Anda
   - Developer contact: isi email Anda
   - Klik **Save and Continue** 3x
   - Klik **Back to Dashboard**
   - Kembali ke **Credentials > Create Credentials > OAuth client ID**
10. Application type: **Web application**
11. Name: **Breeding Ayam Web Client**
12. Authorized JavaScript origins, klik **Add URI**:
    - `http://localhost:3000`
13. Klik **Create**
14. Copy **Your Client ID** dan simpan

---

## ⚙️ Step 4: Konfigurasi Aplikasi (1 menit)

1. Buka file `/app/frontend/.env.local`
2. Isi dengan:

```
REACT_APP_SHEETS_API_URL=https://script.google.com/macros/s/PASTE_WEB_APP_URL_DISINI/exec
REACT_APP_GOOGLE_CLIENT_ID=PASTE_CLIENT_ID_DISINI.apps.googleusercontent.com
```

**Ganti**:
- `PASTE_WEB_APP_URL_DISINI` dengan Web App URL dari Step 2
- `PASTE_CLIENT_ID_DISINI` dengan Client ID dari Step 3

---

## \u25b6️ Step 5: Jalankan Aplikasi (1 menit)

**Aplikasi sudah auto-run di Emergent!**

Jika perlu restart:
```bash
cd /app/frontend
yarn start
```

Akses aplikasi di browser Anda.

---

## \u2705 Selesai!

Sekarang Anda bisa:
1. Login dengan Google
2. Tambah data ayam indukan
3. Catat data breeding
4. Kelola ayam anakan
5. Semua data tersimpan otomatis di Google Sheets!

---

## \ud83d\udd27 Testing

1. Klik **Masuk dengan Google**
2. Pilih akun Google Anda
3. Setelah login, Anda akan masuk ke Dashboard
4. Coba tambah ayam indukan:
   - Klik module "Ayam Indukan"
   - Klik "+ Tambah Indukan"
   - Isi form dan klik Simpan
5. Cek Google Sheets, data akan muncul di sheet `ayam_induk`!

---

## ⚠️ Troubleshooting Cepat

### Google Sign-In tidak muncul?
- Pastikan `REACT_APP_GOOGLE_CLIENT_ID` sudah benar
- Cek browser console untuk error

### Data tidak tersimpan?
- Pastikan `REACT_APP_SHEETS_API_URL` benar
- Cek Apps Script sudah di-deploy dengan access "Anyone"
- Pastikan Spreadsheet ID di Apps Script benar
- Cek nama sheet: `users`, `ayam_induk`, `breeding`, `ayam_anakan` (huruf kecil!)

### Error "Script function not found"?
- Apps Script belum di-save atau deploy ulang
- Pastikan kode Apps Script sudah correct

---

## \ud83d\udcde Butuh Bantuan?

Lihat file `/app/README.md` untuk dokumentasi lengkap atau `/app/SETUP_GUIDE.md` untuk panduan detail.
