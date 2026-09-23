-- Wordly starter catalog: 30 cards (6 cards per theme)
insert into public.themes (id, title, description, emoji) values
('travel','Подорожі','Аеропорт, готель і розмови в дорозі','✈️'),
('food','Їжа та напої','Замовлення, смаки та рецепти','🍳'),
('work','Робота','Зустрічі, листування та карʼєра','💼'),
('home','Дім','Кімнати, побут і повсякденні справи','🏠'),
('verbs','Фразові дієслова','Корисні вирази для живої мови','💬')
on conflict (id) do update set title=excluded.title,description=excluded.description,emoji=excluded.emoji;

insert into public.cards (id,theme_id,english_text,ukrainian_text,example_sentence) values
('travel-001','travel','to figure out','розібратися, зрозуміти','I need time to figure out this problem.'),
('travel-002','travel','a fresh start','новий початок','Moving to a new city felt like a fresh start.'),
('travel-003','travel','a boarding pass','посадковий талон','Please have your boarding pass ready.'),
('travel-004','travel','book a room','забронювати номер','I need to book a room for two nights.'),
('travel-005','travel','get lost','загубитися','We got lost in the old town.'),
('travel-006','travel','a round trip','поїздка туди й назад','Can I buy a round-trip ticket to London?'),
('food-001','food','a snack','перекус','I packed a healthy snack for the trip.'),
('food-002','food','delicious','смачний','This soup is absolutely delicious.'),
('food-003','food','order takeaway','замовити їжу із собою','Let''s order takeaway tonight.'),
('food-004','food','ingredients','інгредієнти','What ingredients do we need?'),
('food-005','food','spicy','гострий','This curry is too spicy for me.'),
('food-006','food','the bill, please','рахунок, будь ласка','Could we have the bill, please?'),
('work-001','work','keep in touch','підтримувати звʼязок','Let''s keep in touch after the course.'),
('work-002','work','a deadline','кінцевий термін','The deadline is next Friday.'),
('work-003','work','schedule a meeting','призначити зустріч','Let''s schedule a meeting for tomorrow.'),
('work-004','work','a workload','робоче навантаження','My workload is lighter this week.'),
('work-005','work','take notes','робити нотатки','I always take notes during meetings.'),
('work-006','work','get promoted','отримати підвищення','She worked hard and got promoted.'),
('home-001','home','tidy up','прибрати','I need to tidy up before the guests arrive.'),
('home-002','home','do the laundry','прати','I do the laundry on Saturdays.'),
('home-003','home','the living room','вітальня','The sofa is in the living room.'),
('home-004','home','turn on','увімкнути','Please turn on the light.'),
('home-005','home','run out of','закінчитися','We have run out of milk.'),
('home-006','home','make yourself at home','почувайся як удома','Come in and make yourself at home.'),
('verbs-001','verbs','look after','піклуватися про','Can you look after my cat this weekend?'),
('verbs-002','verbs','find out','дізнатися','I''ll find out what time the train leaves.'),
('verbs-003','verbs','give up','здатися, кинути','Don''t give up when it gets difficult.'),
('verbs-004','verbs','put off','відкладати','Try not to put off your homework.'),
('verbs-005','verbs','come across','натрапити на','I came across an interesting article.'),
('verbs-006','verbs','work out','вийти, скластися','Everything will work out in the end.')
on conflict (id) do update set theme_id=excluded.theme_id,english_text=excluded.english_text,ukrainian_text=excluded.ukrainian_text,example_sentence=excluded.example_sentence;
