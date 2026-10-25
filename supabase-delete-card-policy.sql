-- Run once in Supabase SQL Editor to enable the delete button for signed-in users.
grant delete on table public.cards to authenticated;

drop policy if exists "Authenticated users delete cards" on public.cards;

create policy "Authenticated users delete cards"
on public.cards
for delete
to authenticated
using (true);
