# \ud83e\udde0 Cara Kerja Sistem - Breeding Ayam Super

## \ud83c\udfdb️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                   USER BROWSER                       │
│  (React App - Login, Dashboard, CRUD Forms)         │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ 1. Login via Google OAuth
                   ▼
┌─────────────────────────────────────────────────────┐
│              GOOGLE AUTHENTICATION                   │
│  (Verifikasi akun, dapat user data)                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ 2. Token + User Data
                   ▼
┌─────────────────────────────────────────────────────┐
│               FRONTEND (React)                       │
│  • Simpan user di localStorage                       │
│  • Setiap API call kirim userEmail                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ 3. HTTP Request (GET/POST)
                   │    dengan userEmail parameter
                   ▼
┌─────────────────────────────────────────────────────┐
│          GOOGLE APPS SCRIPT (Backend API)            │
│  • Terima request                                    │
│  • Validasi userEmail                                │
│  • Filter data by userEmail                          │
│  • CRUD operations                                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ 4. Read/Write Data
                   ▼
┌─────────────────────────────────────────────────────┐
│            GOOGLE SHEETS (Database)                  │
│  • Sheet: users                                      │
│  • Sheet: ayam_induk                                 │
│  • Sheet: breeding                                   │
│  • Sheet: ayam_anakan                                │
└─────────────────────────────────────────────────────┘
```

---

## \ud83d\udd10 Alur Login

1. **User klik "Masuk dengan Google"**
   - Frontend load Google Sign-In JavaScript SDK
   - Tampilkan popup Google login

2. **User pilih akun Google**
   - Google verifikasi identitas
   - Return JWT token ke frontend

3. **Frontend decode token**
   - Dapat user data: email, nama, foto
   - Simpan ke localStorage

4. **Frontend kirim ke Backend**
   - POST ke Google Apps Script dengan action: 'login'
   - Backend cek di sheet 'users', jika belum ada → tambah user baru

5. **User berhasil login**
   - Redirect ke Dashboard
   - Setiap request berikutnya include userEmail

---

## \ud83d\udcc4 Alur CRUD Data

### CREATE (Tambah Data)

```
User fill form → Click Simpan
                     ↓
Frontend validate form
                     ↓
POST ke Apps Script dengan:
  {
    action: 'add_ayam_induk',
    userEmail: 'user@gmail.com',
    kode: 'IND-001',
    jenis_kelamin: 'Jantan',
    ras: 'Bangkok',
    warna: 'Hitam',
    tanggal_lahir: '2024-01-01'
  }
                     ↓
Apps Script:
  - Generate unique ID
  - Add pemilik_email = userEmail
  - Append row ke sheet 'ayam_induk'
                     ↓
Return success → Frontend reload data → Show toast "Berhasil"
```

### READ (Ambil Data)

```
User open Dashboard
         ↓
Frontend: loadAyamInduk()
         ↓
GET ke Apps Script:
  ?path=ayam_induk&userEmail=user@gmail.com
         ↓
Apps Script:
  - Read all data dari sheet 'ayam_induk'
  - Filter: pemilik_email === userEmail
  - Return filtered data
         ↓
Frontend: tampilkan di card list
```

### UPDATE (Edit Data)

```
User click Edit → Modal terbuka dengan data existing
                           ↓
User ubah data → Click Simpan
                           ↓
POST ke Apps Script:
  {
    action: 'update_ayam_induk',
    id: 'uuid-xxx',
    userEmail: 'user@gmail.com',
    kode: 'IND-001-UPDATED',
    ...data lainnya
  }
                           ↓
Apps Script:
  - Find row dengan id matching
  - Update cells di row tersebut
                           ↓
Return success → Frontend reload → Show toast
```

### DELETE (Hapus Data)

```
User click Hapus → Confirm dialog
                        ↓
POST ke Apps Script:
  {
    action: 'delete_ayam_induk',
    id: 'uuid-xxx',
    userEmail: 'user@gmail.com'
  }
                        ↓
Apps Script:
  - Find row dengan id matching
  - Delete entire row
                        ↓
Return success → Frontend reload → Show toast
```

---

## \ud83d\udd12 Keamanan & Privacy

### 1. User Authentication
- ✅ Google OAuth memastikan user adalah pemilik akun Gmail valid
- ✅ Tidak perlu manage password sendiri
- ✅ Token tersimpan di localStorage browser

### 2. Data Isolation
- ✅ Setiap data punya kolom `pemilik_email`
- ✅ Backend selalu filter berdasarkan userEmail
- ✅ User A tidak bisa lihat data User B

### 3. API Security
- ✅ Google Apps Script handle authorization
- ✅ Script berjalan dengan credentials pemilik spreadsheet
- ✅ Access control via "Anyone with link"

---

## \ud83d\udcca Contoh Data di Google Sheets

### Sheet: ayam_induk

| id | kode | jenis_kelamin | ras | warna | tanggal_lahir | pemilik_email |
|----|------|---------------|-----|-------|---------------|---------------|
| abc-123 | IND-001 | Jantan | Bangkok | Hitam | 2024-01-15 | user1@gmail.com |
| def-456 | IND-002 | Betina | Saigon | Merah | 2024-02-20 | user1@gmail.com |
| ghi-789 | IND-003 | Jantan | Burma | Putih | 2024-01-10 | user2@gmail.com |

Jika `user1@gmail.com` login:
- Frontend hanya akan tampilkan IND-001 dan IND-002
- user2@gmail.com tidak bisa lihat data user1

---

## \ud83d\udd04 Sinkronisasi Real-time

**Catatan**: Sistem ini **TIDAK real-time** antar user.

- Setiap user load data saat:
  1. Pertama kali buka halaman
  2. Setelah tambah/edit/hapus data
  3. Manual refresh browser

- Jika 2 user edit data bersamaan:
  - Data tersimpan berdasarkan siapa yang simpan terakhir
  - Google Sheets tidak memiliki locking mechanism

---

## \ud83d\ude80 Kenapa Pakai Google Sheets?

### \ud83d\udc4d Kelebihan:
1. **Gratis 100%** - Tidak perlu bayar database hosting
2. **Easy Setup** - Tidak perlu install database server
3. **Visual** - Bisa edit data langsung di Sheets
4. **Backup** - Google auto-backup data Anda
5. **Excel Export** - Langsung download sebagai Excel/CSV
6. **Collaboration** - Bisa share sheet dengan team

### \ud83d\udc4e Keterbatasan:
1. **Performance** - Lambat untuk data >10,000 rows
2. **No Real-time** - Perlu refresh manual
3. **API Limits** - Google Apps Script punya quota limits
4. **No Complex Query** - Tidak seperti SQL database
5. **Concurrency** - Masalah jika banyak user edit bersamaan

### \ud83c\udfaf Ideal untuk:
- ✅ Aplikasi personal/small team (< 5 users)
- ✅ Data volume kecil (< 5,000 records)
- ✅ Prototype/MVP
- ✅ Budget terbatas
- ✅ Non-critical applications

### ❌ Tidak cocok untuk:
- ❌ High-traffic applications
- ❌ Real-time requirements
- ❌ Complex relationships antar data
- ❌ Production-grade systems
- ❌ Sensitive/confidential data

---

## \ud83d\udee0️ Upgrade Path

Jika aplikasi Anda berkembang, bisa upgrade ke:

### Option 1: Firebase
- Database: Firestore (NoSQL)
- Auth: Firebase Auth (support Google login)
- Hosting: Firebase Hosting
- Benefit: Real-time, scalable, masih gratis untuk traffic rendah

### Option 2: MongoDB + Node.js
- Database: MongoDB Atlas (free tier)
- Backend: Express.js API
- Auth: Passport.js + Google OAuth
- Benefit: Powerful queries, production-ready

### Option 3: Supabase
- Database: PostgreSQL (relational)
- Auth: Built-in authentication
- Hosting: Included
- Benefit: Real-time, SQL queries, free tier generous

---

## \ud83d\udcdd API Endpoints Reference

### GET Endpoints

```
GET {APPS_SCRIPT_URL}?path=ayam_induk&userEmail=xxx
GET {APPS_SCRIPT_URL}?path=breeding&userEmail=xxx
GET {APPS_SCRIPT_URL}?path=ayam_anakan&userEmail=xxx&breeding_id=yyy
```

### POST Endpoints

Semua POST request dengan body:
```json
{
  "action": "add_ayam_induk" | "update_ayam_induk" | "delete_ayam_induk" | ...,
  "userEmail": "user@gmail.com",
  "id": "required-for-update-delete",
  ...data lainnya
}
```

Actions available:
- `login`
- `add_ayam_induk`, `update_ayam_induk`, `delete_ayam_induk`
- `add_breeding`, `update_breeding`, `delete_breeding`
- `add_ayam_anakan`, `update_ayam_anakan`, `delete_ayam_anakan`

---

Sistem ini dirancang sederhana namun powerful untuk kebutuhan breeding ayam Super skala kecil hingga menengah! 🐔🚀
