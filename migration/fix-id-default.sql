-- ============================================================
-- FIX: beri default UUID otomatis pada kolom id.
-- Dijalankan SEKALI untuk tabel yang sudah terlanjur dibuat tanpa default.
-- (Error gejala: 23502 "null value in column id ... violates not-null constraint")
--
-- Aman: data lama TIDAK berubah (tetap pakai UUID hasil import).
-- Hanya insert baru yang akan dapat UUID otomatis.
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

alter table public.ayam_induk  alter column id set default gen_random_uuid();
alter table public.breeding    alter column id set default gen_random_uuid();
alter table public.ayam_anakan alter column id set default gen_random_uuid();
