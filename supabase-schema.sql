-- Wordly / Supabase initial schema
create table if not exists public.themes (id text primary key, title text not null, description text not null default '', emoji text not null default '📚');
create table if not exists public.cards (id text primary key, theme_id text not null references public.themes(id), english_text text not null, ukrainian_text text not null, example_sentence text not null default '', image_url text, audio_en_url text, created_at timestamptz not null default now());
create table if not exists public.user_card_progress (user_id uuid not null references auth.users(id) on delete cascade, card_id text not null references public.cards(id) on delete cascade, direction text not null check (direction in ('en-uk','uk-en')), success_count integer not null default 0, failure_count integer not null default 0, due_at timestamptz not null default now(), learned boolean not null default false, last_reviewed_at timestamptz, primary key (user_id, card_id, direction));
create table if not exists public.review_events (id bigint generated always as identity primary key, user_id uuid not null references auth.users(id) on delete cascade, card_id text not null references public.cards(id) on delete cascade, direction text not null check (direction in ('en-uk','uk-en')), known boolean not null, response_time_ms integer, created_at timestamptz not null default now());
alter table public.user_card_progress enable row level security;
alter table public.review_events enable row level security;
create policy "Users manage own progress" on public.user_card_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own review events" on public.review_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
