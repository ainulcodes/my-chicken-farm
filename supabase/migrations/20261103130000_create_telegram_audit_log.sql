create table if not exists public.telegram_audit_log (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null,
  action            text not null check (action in ('insert', 'update', 'delete')),
  table_name        text not null check (table_name in ('ayam_induk', 'breeding', 'ayam_anakan')),
  record_id         uuid not null,
  record_label      text not null,
  before_data       jsonb,
  after_data        jsonb,
  requested_by      bigint not null,
  chat_id           bigint not null,
  pending_action_id uuid references public.telegram_pending_actions(id) on delete set null,
  undone_at         timestamptz,
  undone_by         bigint,
  created_at        timestamptz not null default now()
);

alter table public.telegram_audit_log enable row level security;

create index if not exists idx_telegram_audit_log_user_recent
  on public.telegram_audit_log(requested_by, created_at desc);
create index if not exists idx_telegram_audit_log_group
  on public.telegram_audit_log(group_id);

alter table public.telegram_pending_actions
  drop constraint if exists telegram_pending_actions_action_check;
alter table public.telegram_pending_actions
  add constraint telegram_pending_actions_action_check
  check (action in ('insert', 'update', 'delete', 'undo'));
