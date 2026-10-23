-- Run once in Supabase SQL Editor after the application update.
alter table public.cards add column if not exists emoji text not null default '📚';

update public.cards
set emoji = case english_text
  when 'to figure out' then '🧭'
  when 'a fresh start' then '🌅'
  when 'a boarding pass' then '🎫'
  when 'book a room' then '🛎️'
  when 'get lost' then '🗺️'
  when 'a round trip' then '🚆'
  when 'keep in touch' then '💬'
  when 'a deadline' then '⏰'
  when 'schedule a meeting' then '📅'
  when 'a workload' then '📚'
  when 'take notes' then '📝'
  when 'get promoted' then '📈'
  when 'a snack' then '🍎'
  when 'delicious' then '😋'
  when 'order takeaway' then '🥡'
  when 'ingredients' then '🥕'
  when 'spicy' then '🌶️'
  when 'the bill, please' then '🧾'
  when 'tidy up' then '🏠'
  when 'do the laundry' then '🧺'
  when 'the living room' then '🛋️'
  when 'turn on' then '💡'
  when 'run out of' then '🥛'
  when 'make yourself at home' then '🪴'
  when 'look after' then '🐾'
  when 'find out' then '🔎'
  when 'give up' then '🏳️'
  when 'put off' then '📌'
  when 'come across' then '📰'
  when 'work out' then '✅'
  when 'check in' then '✈️'
else emoji
end
where emoji = '📚';
