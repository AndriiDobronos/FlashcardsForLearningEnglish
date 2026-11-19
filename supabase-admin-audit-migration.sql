-- Wordly: administrator audit log and card restore actions.
-- Run once after supabase-admin-migration.sql.

create table if not exists public.admin_actions (
  id bigint generated always as identity primary key,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('archive_card', 'restore_card')),
  card_id text references public.cards(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_actions_created_at_idx
  on public.admin_actions (created_at desc);

alter table public.admin_actions enable row level security;

drop policy if exists "Admins read audit log" on public.admin_actions;
create policy "Admins read audit log"
on public.admin_actions
for select
to authenticated
using (public.is_admin());

revoke all on table public.admin_actions from anon, authenticated;
grant select on table public.admin_actions to authenticated;

create or replace function public.admin_archive_card(p_card_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  old_card jsonb;
  changed boolean;
  affected_rows integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select to_jsonb(c) into old_card
  from public.cards c
  where c.id = p_card_id and c.archived_at is null;

  if old_card is null then
    return false;
  end if;

  update public.cards
  set archived_at = now()
  where id = p_card_id and archived_at is null;

  get diagnostics affected_rows = row_count;
  changed := affected_rows > 0;

  if changed then
    insert into public.admin_actions (admin_user_id, action, card_id, details)
    values (auth.uid(), 'archive_card', p_card_id, jsonb_build_object('card', old_card));
  end if;

  return changed;
end;
$$;

create or replace function public.admin_restore_card(p_card_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  changed boolean;
  affected_rows integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  update public.cards
  set archived_at = null
  where id = p_card_id and archived_at is not null;

  get diagnostics affected_rows = row_count;
  changed := affected_rows > 0;

  if changed then
    insert into public.admin_actions (admin_user_id, action, card_id)
    values (auth.uid(), 'restore_card', p_card_id);
  end if;

  return changed;
end;
$$;

grant execute on function public.admin_archive_card(text) to authenticated;
grant execute on function public.admin_restore_card(text) to authenticated;

drop policy if exists "Anyone can read active cards" on public.cards;
create policy "Anyone can read active cards"
on public.cards
for select
to anon, authenticated
using (archived_at is null or public.is_admin());
