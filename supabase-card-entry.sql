-- Виконайте один раз у Supabase -> SQL Editor.
-- Це дозволяє авторизованим користувачам додавати картки через /add-card.

grant select on table public.themes, public.cards to anon, authenticated;
grant insert on table public.cards to authenticated;

alter table public.cards enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='cards'
      and policyname='Anyone can read cards'
  ) then
    create policy "Anyone can read cards"
      on public.cards for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='cards'
      and policyname='Users add own cards'
  ) then
    create policy "Users add own cards"
      on public.cards for insert
      to authenticated
      with check (auth.uid() = created_by);
  end if;
end $$;
