-- ============================================================
-- Schema Supabase untuk "My Chicken Farm"
-- Migrasi dari Google Sheets (V1, single-tenant / tanpa login per-user)
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- Catatan desain:
-- * id memakai UUID yang SUDAH ADA dari Sheets (bukan generate baru),
--   supaya relasi lama (pejantan_id, betina_id, breeding_id) tetap valid.
-- * Tanggal disimpan sebagai DATE (tanggal saja, tanpa jam). Konversi zona
--   waktu (WIB) ditangani oleh script import, jadi di sini cukup DATE.
-- * Aplikasi aktif TIDAK punya kolom pemilik_email -> single-tenant.

-- ---------- AYAM INDUK ----------
create table if not exists public.ayam_induk (
  id                uuid primary key default gen_random_uuid(),
  kode              text not null,
  jenis_kelamin     text,           -- 'Jantan' | 'Betina'
  ras               text,
  warna             text,
  tanggal_lahir     date,
  status            text,           -- 'Sehat' | 'Mati' | dst
  folder_gdrive_id  text,
  folder_gdrive_url text,
  created_at        timestamptz not null default now()
);

-- ---------- BREEDING ----------
create table if not exists public.breeding (
  id              uuid primary key default gen_random_uuid(),
  pejantan_id     uuid references public.ayam_induk(id) on delete set null,
  betina_id       uuid references public.ayam_induk(id) on delete set null,
  tanggal_kawin   date,
  tanggal_menetas date,
  jumlah_anakan   integer default 0,
  created_at      timestamptz not null default now()
);

-- ---------- AYAM ANAKAN ----------
create table if not exists public.ayam_anakan (
  id                uuid primary key default gen_random_uuid(),
  breeding_id       uuid references public.breeding(id) on delete cascade,
  kode              text,
  jenis_kelamin     text,
  warna             text,
  status            text,
  folder_gdrive_id  text,
  folder_gdrive_url text,
  created_at        timestamptz not null default now()
);

-- Index untuk query relasi yang sering dipakai
create index if not exists idx_breeding_pejantan on public.breeding(pejantan_id);
create index if not exists idx_breeding_betina   on public.breeding(betina_id);
create index if not exists idx_anakan_breeding   on public.ayam_anakan(breeding_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
-- Strategi single-tenant + login admin via Supabase Auth:
--   * Publik (dashboard publik) boleh BACA (select).
--   * Hanya user yang sudah login (authenticated) yang boleh tulis.
-- Sesuaikan kalau ingin lebih ketat (mis. batasi ke email admin tertentu).

alter table public.ayam_induk  enable row level security;
alter table public.breeding    enable row level security;
alter table public.ayam_anakan enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ayam_induk','breeding','ayam_anakan']
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$s;', t);
    execute format('drop policy if exists "auth write %1$s" on public.%1$s;', t);

    -- Semua orang boleh baca
    execute format($f$create policy "public read %1$s" on public.%1$s
      for select using (true);$f$, t);

    -- Hanya user login yang boleh insert/update/delete
    execute format($f$create policy "auth write %1$s" on public.%1$s
      for all to authenticated using (true) with check (true);$f$, t);
  end loop;
end $$;
