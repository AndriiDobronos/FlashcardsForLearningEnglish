# FlashcardsForLearningEnglish

MVP вебдодатка для вивчення англійських слів і фраз через картки та інтервальні повторення.

## Стек

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- React
- pnpm 10

## Запуск

```bash
pnpm install
pnpm dev
```

Відкрийте http://localhost:3000.

## Реалізовано

- `/` — Dashboard зі streak і статистикою за 5 днів.
- `/study` — картки з перевертанням, озвученням і кнопками «знаю / повторити».
- `/sets` — вибір тематичних наборів із локальним збереженням у браузері.
- `lib/data.ts` — демо-каталог карток і локальне сховище прогресу.
- `lib/scheduler.ts` — початкова шкала повторень: 1, 3, 7, 14, 30, 90 і 180 днів.
- `supabase-schema.sql` — підготовлена схема для Auth, карток, прогресу та історії повторень.

## Поточний стан

Застосунок працює у demo/local-first режимі без авторизації, а після входу через Supabase синхронізує прогрес між пристроями. Дані навчання зберігаються у `user_card_progress`, а історія відповідей — у `review_events`.

## Supabase підключення

1. Скопіюйте `.env.example` у `.env.local`.
2. У Supabase відкрийте Project Settings → API і вставте `anon` public key у `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Виконайте `pnpm install`, щоб встановити `@supabase/supabase-js`.
4. Перезапустіть `pnpm dev`.
5. Відкрийте `/auth` і увійдіть через magic link.

Без `.env.local` застосунок продовжує працювати в demo/local-first режимі. Після входу кожна відповідь у навчальній сесії синхронізується з `user_card_progress` і `review_events`.

## Production

Інструкція для розгортання на Vercel описана у [DEPLOYMENT.md](DEPLOYMENT.md).
