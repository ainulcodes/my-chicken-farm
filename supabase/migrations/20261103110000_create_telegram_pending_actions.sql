create table if not exists public.telegram_pending_actions (
  id            uuid primary key default gen_random_uuid(),
  action        text not null check (action in ('delete')),
  table_name    text not null check (table_name in ('ayam_induk', 'breeding', 'ayam_anakan')),
  record_id     uuid not null,
  record_label  text not null,
  requested_by  bigint not null,
  chat_id       bigint not null,
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cancelled', 'expired')),
  expires_at    timestamptz not null,
  executed_at   timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.telegram_pending_actions enable row level security;

-- Tidak ada policy public/authenticated. Hanya Edge Function dengan secret key
-- yang dapat membuat atau mengeksekusi pending action.
create index if not exists idx_telegram_pending_actions_lookup
  on public.telegram_pending_actions(id, status, expires_at);
