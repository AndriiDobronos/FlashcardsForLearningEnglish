-- Wordly: per-user themes and ownership for personal cards.
-- Run once in Supabase -> SQL Editor.

alter table public.cards
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create table if not exists public.user_themes (
  user_id uuid not null references auth.users(id) on delete cascade,
  theme_id text not null references public.themes(id) on delete cascade,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, theme_id)
);

alter table public.user_themes enable row level security;

drop policy if exists "Users manage own themes" on public.user_themes;
create policy "Users manage own themes"
on public.user_themes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.user_themes to authenticated;
grant select on table public.cards to anon, authenticated;
grant insert on table public.cards to authenticated;

drop policy if exists "Authenticated users add cards" on public.cards;
create policy "Users add own cards"
on public.cards
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "Authenticated users delete cards" on public.cards;
create policy "Users delete own cards"
on public.cards
for delete
to authenticated
using (auth.uid() = created_by);
