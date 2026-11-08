-- Wordly: personal spaced-repetition fields for each user/card/direction.
-- Run once in Supabase -> SQL Editor before deploying the new application code.

alter table public.user_card_progress
  add column if not exists total_reviews integer not null default 0,
  add column if not exists total_known integer not null default 0,
  add column if not exists total_unknown integer not null default 0,
  add column if not exists session_known integer not null default 0,
  add column if not exists session_unknown integer not null default 0,
  add column if not exists success_streak integer not null default 0,
  add column if not exists ease_factor numeric(4,2) not null default 2.30,
  add column if not exists interval_days integer not null default 0,
  add column if not exists last_session_date date;

-- Preserve progress created by the previous version of the application.
update public.user_card_progress
set total_known = greatest(total_known, success_count),
    total_unknown = greatest(total_unknown, failure_count),
    total_reviews = greatest(total_reviews, success_count + failure_count),
    ease_factor = case when ease_factor < 1.30 then 1.30 when ease_factor > 2.80 then 2.80 else ease_factor end
where total_reviews = 0
   or total_known = 0 and success_count > 0
   or total_unknown = 0 and failure_count > 0;

create index if not exists user_card_progress_due_at_idx
  on public.user_card_progress (user_id, due_at);

create index if not exists user_card_progress_card_idx
  on public.user_card_progress (user_id, card_id);

grant select, insert, update on table public.user_card_progress to authenticated;
grant select, insert on table public.review_events to authenticated;
