# Telegram CRUD — Tambah, Ubah, Hapus

Bot mendukung operasi tulis dengan field allowlist. Tambah dan ubah dijalankan
melalui perintah eksplisit. Hapus selalu membutuhkan tombol konfirmasi dan
permintaannya kedaluwarsa setelah 10 menit.

## Aktivasi

Tinjau migration yang akan dijalankan:

```bash
npx supabase db push --remote --dry-run
```

Pastikan migration baru yang terlihat adalah:

```text
20261103110000_create_telegram_pending_actions.sql
20261103120000_extend_pending_actions_for_natural_crud.sql
```

Terapkan dan deploy:

```bash
npx supabase db push --remote
npx supabase functions deploy telegram-assistant --no-verify-jwt --use-api
```

## Aktifkan callback tombol Telegram

Webhook perlu menerima `callback_query` selain `message`. Jalankan kembali
`setWebhook` dengan token bot dan webhook secret yang sama:

```bash
curl --fail-with-body --request POST \
  'https://api.telegram.org/botTOKEN_BOT_ANDA/setWebhook' \
  --header 'content-type: application/json' \
  --data '{
    "url": "https://ofdeyqwspolppnudebuq.supabase.co/functions/v1/telegram-assistant",
    "secret_token": "WEBHOOK_SECRET_ANDA",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": false
  }'
```

Verifikasi `allowed_updates` melalui `getWebhookInfo`. Hasilnya harus berisi
`message` dan `callback_query`.

## Contoh perintah

### Indukan

```text
/tambah indukan kode=PJ-01 nama="Jago Merah" jk=Jantan ras=Bangkok warna=Merah status=Sehat
/ubah indukan PJ-01 warna=Hitam status=Sehat
/hapus indukan PJ-01
```

### Breeding

Kode pejantan dan betina otomatis diubah menjadi UUID indukan.

```text
/tambah breeding pejantan=PJ-01 betina=BT-01 kawin=2026-11-03 menetas=2026-11-24 jumlah=0
/ubah breeding UUID_BREEDING jumlah=8 menetas=2026-11-25
/hapus breeding UUID_BREEDING
```

### Anakan

```text
/tambah anakan kode=AN-01 nama="Anak Satu" jk=Betina warna=Putih status=Sehat
/ubah anakan AN-01 status=Mati
/hapus anakan AN-01
```

Ketik `/crud` di Telegram untuk melihat bantuan yang sama.

## CRUD dengan bahasa biasa

Permintaan bahasa biasa diterjemahkan AI menjadi JSON intent, divalidasi oleh
server, lalu selalu menampilkan preview dan tombol konfirmasi.

```text
update indukan BTN-001-H2 ke status mati
ubah warna indukan BTN-001-H2 menjadi hitam
hapus indukan BTN-001-H2
tambahkan indukan kode PJ-10 bernama Jago Hitam, jantan, warna merah, status sehat
catat breeding pejantan PJ-01 dengan betina BT-02 tanggal kawin hari ini
```

Jika kalimat ambigu atau data wajib belum lengkap, bot meminta klarifikasi dan
tidak membuat perubahan.

## Aturan keamanan

- Operasi hanya diterima dari private chat dan user allowlist.
- Nama tabel dan field tidak pernah diterima secara bebas; semuanya memakai
  allowlist di kode.
- Gemini hanya menghasilkan intent JSON dan tidak memegang key database.
- Semua CRUD bahasa biasa memerlukan konfirmasi, termasuk tambah dan update.
- Tombol konfirmasi terikat pada user dan chat pembuat permintaan.
- Pending delete kedaluwarsa setelah 10 menit.
- Tombol yang sudah dikonfirmasi atau dibatalkan tidak dapat digunakan ulang.
- Secret key Supabase hanya tersedia di Edge Function dan tidak dikirim ke
  Telegram atau frontend.
