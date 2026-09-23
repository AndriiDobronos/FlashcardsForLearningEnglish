-- Додавання нової картки до тематичного набору.
-- 1. Замініть значення в одному рядку нижче.
-- 2. Виконайте цей SQL у Supabase -> SQL Editor.
-- image_url можна залишити NULL: застосунок використає тематичне fallback-зображення.

insert into public.cards
  (id, theme_id, english_text, ukrainian_text, example_sentence, image_url)
values
  ('travel-007', 'travel', 'check in', 'зареєструватися / пройти реєстрацію', 'We need to check in two hours before the flight.', null)
on conflict (id) do update set
  theme_id=excluded.theme_id,
  english_text=excluded.english_text,
  ukrainian_text=excluded.ukrainian_text,
  example_sentence=excluded.example_sentence,
  image_url=excluded.image_url;
