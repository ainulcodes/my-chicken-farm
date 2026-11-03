# Pengingat Telegram Jadwal Menetas

Function `hatch-reminders` mengirim notifikasi Telegram pada H-7, H-3, H-1,
dan Hari-H berdasarkan kolom `breeding.tanggal_menetas`. Pengiriman dicatat di
`telegram_notification_log` sehingga job yang berjalan ulang tidak mengirim
duplikat.

## 1. Terapkan migration

Dari root project yang sudah terhubung ke Supabase:

```bash
npx supabase db push --remote --dry-run
npx supabase db push --remote
```

Alternatif: buka Supabase Dashboard → SQL Editor, lalu jalankan isi file
`supabase/migrations/20261103090000_create_telegram_notification_log.sql`.

## 2. Tambahkan secrets

Buat secret khusus cron:

```bash
openssl rand -hex 32
```

Simpan hasilnya, lalu jalankan:

```bash
npx supabase secrets set \
  REMINDER_CRON_SECRET='HASIL_OPENSSL' \
  TELEGRAM_NOTIFICATION_CHAT_IDS='1679295507' \
  GEMINI_FALLBACK_MODELS='gemini-3.5-flash-lite,gemini-3.1-flash-lite'
```

`TELEGRAM_NOTIFICATION_CHAT_IDS` dapat berisi beberapa ID dipisahkan koma.
Jika tidak diisi, function menggunakan `ALLOWED_TELEGRAM_USER_IDS`.

## 3. Deploy kedua function

```bash
npx supabase functions deploy telegram-assistant --no-verify-jwt --use-api
npx supabase functions deploy hatch-reminders --no-verify-jwt --use-api
```

Webhook Telegram tidak perlu diubah karena tetap menunjuk ke
`telegram-assistant`.

## 4. Uji function pengingat

```bash
curl --fail-with-body --request POST \
  'https://ofdeyqwspolppnudebuq.supabase.co/functions/v1/hatch-reminders' \
  --header 'content-type: application/json' \
  --header 'x-cron-secret: HASIL_OPENSSL' \
  --data '{}'
```

Contoh hasil ketika tidak ada jadwal yang cocok:

```json
{"ok":true,"date":"2026-11-03","matched":0,"sent":0,"skipped":0,"errors":[]}
```

Jika ada breeding dengan `tanggal_menetas` tepat 0, 1, 3, atau 7 hari dari
hari ini, bot akan mengirim notifikasi. Menjalankan request yang sama lagi akan
menaikkan `skipped`, bukan mengirim duplikat.

## 5. Buat jadwal harian

1. Buka Supabase Dashboard project.
2. Pilih **Integrations → Cron** dan aktifkan Cron jika belum aktif.
3. Klik **Create job**.
4. Nama job: `telegram-hatch-reminders`.
5. Schedule: `0 1 * * *` (01.00 UTC = 08.00 WIB).
6. Pilih tipe **HTTP Request** dengan method `POST`.
7. URL:

   ```text
   https://ofdeyqwspolppnudebuq.supabase.co/functions/v1/hatch-reminders
   ```

8. Tambahkan headers:

   ```json
   {
     "Content-Type": "application/json",
     "x-cron-secret": "HASIL_OPENSSL"
   }
   ```

9. Body: `{}`.
10. Simpan dan pastikan job berstatus **Active**.

Gunakan tombol **History** pada halaman Cron untuk memeriksa eksekusi. Log
function tersedia di Edge Functions → `hatch-reminders` → Logs.

## Menonaktifkan notifikasi

Ubah job menjadi **Inactive** dari halaman Cron. Data breeding dan log
pengiriman tidak akan terhapus.
