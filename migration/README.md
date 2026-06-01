# Migrasi: Google Sheets → Supabase

Folder ini berisi semua aset untuk memindahkan data dari Google Sheets (backend lama via Apps Script) ke Supabase (Postgres).

## Isi folder

| File | Fungsi |
|---|---|
| `export-sheets.js` | Tarik semua data dari Apps Script (read-only) → simpan JSON + CSV ke `backup/` |
| `schema.sql` | Buat tabel `ayam_induk`, `breeding`, `ayam_anakan` + foreign key + RLS di Supabase |
| `import-to-supabase.js` | Baca JSON backup → upsert ke Supabase (idempotent) |
| `.env.example` | Template kredensial Supabase untuk script import |
| `backup/` | Hasil export (di-gitignore — berisi data asli) |

## Urutan langkah

### 1. Backup data lama (sudah dijalankan)
```bash
node migration/export-sheets.js
```
Menghasilkan `migration/backup/<timestamp>/` berisi `*.json`, `*.csv`, dan `_manifest.json`.
Aman dijalankan ulang kapan saja untuk mengambil snapshot terbaru.

### 2. Buat project Supabase & jalankan schema
1. Buat project di https://supabase.com
2. Buka **SQL Editor → New query**, paste isi `schema.sql`, klik **Run**.

### 3. Siapkan kredensial
```bash
cp migration/.env.example migration/.env
# isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (dari Project Settings → API)
```
> `service_role key` bersifat RAHASIA (bypass RLS). Hanya untuk script lokal ini, jangan dipakai di frontend. `migration/.env` sudah di-gitignore.

### 4. Import data ke Supabase
```bash
node migration/import-to-supabase.js
```
Idempotent (upsert by `id`) — boleh diulang. Urutan insert mengikuti foreign key: induk → breeding → anakan.

### 5. Lanjut: ganti frontend ke Supabase
Setelah data masuk, langkah berikutnya adalah mengganti `frontend/src/services/api.js` agar memakai `@supabase/supabase-js` (interface method dipertahankan supaya komponen UI tidak berubah), plus setup Supabase Auth untuk login admin.

## Catatan penting tentang data

- **UUID dipertahankan** — `id` lama dipakai sebagai primary key, jadi relasi antar tabel tetap valid.
- **Konversi tanggal** — Sheets menyimpan tanggal sebagai tengah malam WIB (mis. `...T17:00:00.000Z` = hari berikutnya pukul 00:00 WIB). Script import mengonversi ke `YYYY-MM-DD` zona `Asia/Jakarta` agar tanggal tidak mundur 1 hari.
- **Single-tenant** — data asli tidak punya `pemilik_email`; aplikasi yang aktif adalah versi tanpa login per-user.
