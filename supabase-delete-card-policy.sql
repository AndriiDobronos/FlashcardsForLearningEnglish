-- Run once in Supabase SQL Editor after the user-themes migration.
grant delete on table public.cards to authenticated;

drop policy if exists "Authenticated users delete cards" on public.cards;
drop policy if exists "Users delete own cards" on public.cards;

create policy "Users delete own cards"
on public.cards
for delete
to authenticated
using (auth.uid() = created_by);
