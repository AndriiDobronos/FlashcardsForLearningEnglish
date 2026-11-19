-- Wordly: administrator role and safe card archiving.
-- Run once in Supabase SQL Editor after the previous cards/user-themes migrations.

alter table public.cards
  add column if not exists archived_at timestamptz;

create index if not exists cards_active_idx
  on public.cards (archived_at)
  where archived_at is null;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on table public.admin_users from anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- Add the administrator account after it has signed in at least once.
insert into public.admin_users (user_id, email, role)
select id, email, 'admin'
from auth.users
where lower(email) = lower('adriidobronos@gmail.com')
on conflict (user_id) do update set email = excluded.email, role = 'admin';

drop policy if exists "Anyone can read cards" on public.cards;
drop policy if exists "Anyone can read active cards" on public.cards;
create policy "Anyone can read active cards"
on public.cards
for select
to anon, authenticated
using (archived_at is null);

drop policy if exists "Users update own cards" on public.cards;
drop policy if exists "Owners and admins update cards" on public.cards;
create policy "Owners and admins update cards"
on public.cards
for update
to authenticated
using (auth.uid() = created_by or public.is_admin())
with check (auth.uid() = created_by or public.is_admin());

drop policy if exists "Users delete own cards" on public.cards;
drop policy if exists "Authenticated users delete cards" on public.cards;
revoke delete on table public.cards from authenticated;
