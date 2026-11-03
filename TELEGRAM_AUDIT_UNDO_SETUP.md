# Telegram Audit Log dan Undo

Semua add, update, delete, dan bulk CRUD yang dijalankan bot dicatat sebagai
satu grup aksi. Audit menyimpan snapshot sebelum/sesudah, user Telegram, chat,
dan waktu perubahan.

## Aktivasi

```bash
npx supabase db push --remote --dry-run
```

Pastikan migration berikut terlihat:

```text
20261103130000_create_telegram_audit_log.sql
```

Lalu jalankan:

```bash
npx supabase db push --remote
npx supabase functions deploy telegram-assistant --no-verify-jwt --use-api
```

Audit hanya berlaku untuk perubahan yang dilakukan setelah migration dan versi
function ini aktif. Perubahan lama tidak dapat di-undo karena snapshot lamanya
tidak tersedia.

## Penggunaan

Lihat riwayat:

```text
/riwayat
```

Batalkan aksi terakhir:

```text
/undo
```

atau:

```text
batalkan perubahan terakhir
```

Bot menampilkan preview lalu tombol **Konfirmasi Undo** dan **Batal**. Pending
undo berlaku 10 menit.

## Cakupan rollback

- Insert dibatalkan dengan menghapus record yang dibuat.
- Update mengembalikan snapshot sebelum perubahan.
- Delete mengembalikan record yang dihapus.
- Delete breeding juga memulihkan anakan yang terhapus cascade.
- Delete indukan juga mengembalikan referensi pejantan/betina pada breeding.
- Satu bulk CRUD dibatalkan sebagai satu grup.

Undo saat ini bersifat last-action undo, bukan redo. Aksi yang sudah dibatalkan
ditandai pada audit dan tidak dipilih lagi oleh `/undo` berikutnya.
