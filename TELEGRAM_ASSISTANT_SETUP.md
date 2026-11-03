# Telegram AI Assistant — Setup

Implementasi berada di `supabase/functions/telegram-assistant`. Bot bersifat
**read-only**: ia hanya membaca `ayam_induk`, `breeding`, dan `ayam_anakan`.

## 1. Buat bot dan dapatkan user ID

1. Chat `@BotFather` di Telegram, jalankan `/newbot`, lalu simpan token bot.
2. Untuk mengetahui numeric user ID, chat bot seperti `@userinfobot` atau lihat
   field `message.from.id` melalui `getUpdates` saat setup awal.
3. Buat secret webhook acak sepanjang 32–256 karakter. Karakter yang didukung
   Telegram: `A-Z`, `a-z`, `0-9`, `_`, dan `-`.

Jangan menaruh token bot atau service-role key di frontend maupun Git.

## 2. Siapkan Gemini (opsional)

Buat API key di Google AI Studio. Tanpa Gemini, `/ringkasan`, `/indukan`,
`/menetas`, `/id`, dan `/help` tetap berfungsi. Nama model dapat diganti melalui
secret `GEMINI_MODEL` tanpa mengubah kode.

## 3. Deploy Edge Function

Pasang Supabase CLI, login, lalu dari root repository jalankan:

```bash
supabase link --project-ref PROJECT_REF
supabase secrets set \
  TELEGRAM_BOT_TOKEN='TOKEN_DARI_BOTFATHER' \
  TELEGRAM_WEBHOOK_SECRET='SECRET_ACAK' \
  ALLOWED_TELEGRAM_USER_IDS='USER_ID_1,USER_ID_2' \
  GEMINI_API_KEY='GEMINI_API_KEY' \
  GEMINI_MODEL='gemini-3.8-flash'
supabase functions deploy telegram-assistant --no-verify-jwt
```

`SUPABASE_URL` dan `SUPABASE_SECRET_KEYS` otomatis tersedia pada Edge Function
yang di-host Supabase. Jangan menambahkannya sebagai custom secret; prefix
`SUPABASE_` dicadangkan oleh platform.

## 4. Daftarkan webhook Telegram

Ganti semua placeholder, lalu jalankan sekali:

```bash
curl --fail-with-body --request POST \
  "https://api.telegram.org/botTELEGRAM_BOT_TOKEN/setWebhook" \
  --header 'content-type: application/json' \
  --data '{
    "url": "https://PROJECT_REF.supabase.co/functions/v1/telegram-assistant",
    "secret_token": "SECRET_ACAK",
    "allowed_updates": ["message"],
    "drop_pending_updates": true
  }'
```

Verifikasi status webhook:

```bash
curl --fail-with-body \
  "https://api.telegram.org/botTELEGRAM_BOT_TOKEN/getWebhookInfo"
```

Setelah aktif, kirim `/help` dan `/ringkasan` ke bot.

## Perintah

- `/ringkasan` — jumlah indukan, breeding, anakan, dan jadwal menetas dekat.
- `/indukan KODE atau NAMA` — pencarian maksimal 10 hasil.
- `/menetas 14` — jadwal menetas dalam 14 hari; rentang 1–60 hari.
- `/id` — menampilkan numeric Telegram user ID.
- Pertanyaan biasa — dijawab Gemini berdasarkan snapshot database, maksimal 500
  baris per tabel.

## Keamanan dan batasan

- Request webhook diverifikasi melalui header secret Telegram.
- Hanya user ID dalam `ALLOWED_TELEGRAM_USER_IDS` yang diproses.
- Pesan grup ditolak; bot hanya menjawab private chat agar data tidak bocor.
- Service-role key hanya berada di secret server dan tidak dikirim ke browser.
- AI tidak menerima fungsi SQL dan tidak memiliki operasi tulis.
- Karena snapshot AI dibatasi 500 baris per tabel, gunakan perintah deterministik
  atau tambahkan agregasi server-side bila data tumbuh lebih besar.
- Rotasi token bot melalui `@BotFather` jika token pernah terlihat orang lain.
