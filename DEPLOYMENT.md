# Production deployment

Рекомендований варіант для цього Next.js-застосунку — Vercel Free.

## 1. Підготувати репозиторій

Опублікуйте проєкт у GitHub і переконайтеся, що файл `.env.local` не додається до репозиторію. Він уже виключений у `.gitignore`.

## 2. Створити проєкт у Vercel

1. У Vercel натисніть **Add New → Project**.
2. Імпортуйте репозиторій GitHub.
3. Framework Preset залиште **Next.js**.
4. Build Command: `pnpm build`.
5. Install Command: `pnpm install`.
6. Додайте Environment Variables для Production, Preview і Development:

```text
NEXT_PUBLIC_SUPABASE_URL=https://gsqpedqwkaltyfzpefdg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_public_key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` можна передавати у браузер: це public-ключ, а доступ до рядків захищений RLS-політиками. Service role key у Vercel або код додавати не можна.

## 3. Додати production URL у Supabase

Після першого deploy Vercel надасть адресу на кшталт `https://назва-проєкту.vercel.app`.

У Supabase відкрийте **Authentication → URL Configuration** і встановіть:

- **Site URL** — production URL Vercel;
- **Redirect URL** — `https://назва-проєкту.vercel.app/auth/callback`;
- залиште також `http://localhost:3000/auth/callback` для локальної розробки.

## 4. Перевірити production

1. Відкрийте production URL.
2. Увійдіть через `/auth`.
3. Переконайтеся, що email відображається у верхньому меню.
4. Зробіть свайп на `/study`.
5. Перевірте появу запису у Supabase Table Editor → `user_card_progress`.

## 5. Важливі обмеження Free-плану

- Supabase built-in email provider має дуже низькі ліміти; для реальних користувачів краще підключити власний SMTP.
- Не зберігайте service role key у клієнтському коді або змінних `NEXT_PUBLIC_*`.
- Після зміни змінних середовища у Vercel потрібно виконати новий deploy.
