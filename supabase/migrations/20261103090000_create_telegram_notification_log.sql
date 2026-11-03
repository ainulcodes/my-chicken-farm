create table if not exists public.telegram_notification_log (
  id             uuid primary key default gen_random_uuid(),
  breeding_id    uuid not null references public.breeding(id) on delete cascade,
  hatch_date     date not null,
  reminder_days  integer not null check (reminder_days in (0, 1, 3, 7)),
  chat_id        bigint not null,
  sent_at        timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  unique (breeding_id, hatch_date, reminder_days, chat_id)
);

alter table public.telegram_notification_log enable row level security;

-- Tidak ada policy untuk anon/authenticated. Tabel hanya diakses Edge Function
-- menggunakan secret key Supabase yang melewati RLS.
create index if not exists idx_telegram_notification_log_sent_at
  on public.telegram_notification_log(sent_at desc);
