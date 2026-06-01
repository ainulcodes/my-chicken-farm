-- ============================================================
-- Tambah kolom nama (panggilan) & marga (nama keluarga) ayam.
-- Jalankan SEKALI di Supabase -> SQL Editor -> Run.
--   - Indukan: tiap ekor punya marga sendiri.
--   - Anakan : marga mewarisi pejantan (diisi otomatis dari aplikasi).
-- Nama lengkap = "Marga Nama" (urutan China), Latin. Contoh: "Long Wei".
-- Aman: kolom nullable, data lama tidak berubah.
-- ============================================================

alter table public.ayam_induk  add column if not exists nama  text;
alter table public.ayam_induk  add column if not exists marga text;

alter table public.ayam_anakan add column if not exists nama  text;
alter table public.ayam_anakan add column if not exists marga text;
