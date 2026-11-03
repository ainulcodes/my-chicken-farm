alter table public.telegram_pending_actions
  drop constraint if exists telegram_pending_actions_action_check;

alter table public.telegram_pending_actions
  add constraint telegram_pending_actions_action_check
  check (action in ('insert', 'update', 'delete'));

alter table public.telegram_pending_actions
  alter column record_id drop not null;

alter table public.telegram_pending_actions
  add column if not exists payload jsonb not null default '{}'::jsonb;
