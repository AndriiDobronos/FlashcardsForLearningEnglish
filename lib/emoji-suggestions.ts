type EmojiEntry = { emoji: string; keywords: string[] };

const emojiEntries: EmojiEntry[] = [
  { emoji: "✈️", keywords: ["flight", "fly", "airplane", "airport", "travel", "подорож"] },
  { emoji: "🛫", keywords: ["flight", "departure", "take off", "airport"] },
  { emoji: "🧳", keywords: ["luggage", "suitcase", "travel", "trip"] },
  { emoji: "🌍", keywords: ["world", "country", "abroad", "travel"] },
  { emoji: "🏨", keywords: ["hotel", "room", "stay", "booking"] },
  { emoji: "🗣️", keywords: ["speak", "talk", "conversation", "language"] },
  { emoji: "📧", keywords: ["email", "message", "mail", "work"] },
  { emoji: "💻", keywords: ["computer", "online", "office", "work"] },
  { emoji: "🤝", keywords: ["meeting", "agree", "deal", "business"] },
  { emoji: "🍌", keywords: ["banana", "fruit", "snack", "food"] },
  { emoji: "🍕", keywords: ["pizza", "food", "meal", "restaurant"] },
  { emoji: "☕", keywords: ["coffee", "drink", "cafe", "breakfast"] },
  { emoji: "🍽️", keywords: ["restaurant", "dinner", "meal", "food"] },
  { emoji: "🎂", keywords: ["birthday", "cake", "celebrate", "party"] },
  { emoji: "❤️", keywords: ["love", "heart", "like", "feelings"] },
  { emoji: "😊", keywords: ["happy", "smile", "glad", "joy"] },
  { emoji: "😢", keywords: ["sad", "cry", "unhappy", "tears"] },
  { emoji: "😡", keywords: ["angry", "mad", "annoyed", "emotion"] },
  { emoji: "🤔", keywords: ["think", "wonder", "question", "consider"] },
  { emoji: "🎯", keywords: ["goal", "target", "aim", "plan"] },
  { emoji: "🚀", keywords: ["start", "launch", "success", "growth"] },
  { emoji: "💰", keywords: ["money", "price", "salary", "pay", "cost"] },
  { emoji: "🎁", keywords: ["gift", "present", "surprise", "give"] },
  { emoji: "📖", keywords: ["book", "read", "learn", "study"] },
  { emoji: "🎓", keywords: ["school", "university", "education", "learn"] },
  { emoji: "🏃", keywords: ["run", "exercise", "sport", "quick"] },
  { emoji: "⚽", keywords: ["football", "soccer", "sport", "game"] },
  { emoji: "🌧️", keywords: ["rain", "weather", "storm", "wet"] },
  { emoji: "☀️", keywords: ["sun", "sunny", "weather", "hot"] },
  { emoji: "❄️", keywords: ["snow", "winter", "cold", "weather"] },
  { emoji: "🌳", keywords: ["tree", "nature", "park", "green"] },
  { emoji: "🐶", keywords: ["dog", "pet", "animal"] },
  { emoji: "🐱", keywords: ["cat", "pet", "animal"] },
  { emoji: "🚗", keywords: ["car", "drive", "road", "transport"] },
  { emoji: "🚌", keywords: ["bus", "transport", "station", "travel"] },
  { emoji: "🚲", keywords: ["bike", "bicycle", "ride", "transport"] },
  { emoji: "🔑", keywords: ["key", "open", "door", "access"] },
  { emoji: "🚪", keywords: ["door", "room", "enter", "house"] },
  { emoji: "🛒", keywords: ["shop", "shopping", "buy", "store"] },
  { emoji: "📱", keywords: ["phone", "call", "mobile", "contact"] },
  { emoji: "🔔", keywords: ["notification", "bell", "reminder", "alert"] },
  { emoji: "⚠️", keywords: ["warning", "danger", "careful", "attention"] },
  { emoji: "❓", keywords: ["question", "what", "why", "unknown"] },
  { emoji: "💡", keywords: ["idea", "light", "think", "solution"] },
  { emoji: "🔨", keywords: ["build", "work", "repair", "tool"] },
  { emoji: "🧹", keywords: ["clean", "cleaning", "tidy", "house"] },
  { emoji: "🛏️", keywords: ["bed", "sleep", "bedroom", "rest"] },
  { emoji: "🚿", keywords: ["shower", "bathroom", "wash", "clean"] },
  { emoji: "👕", keywords: ["clothes", "shirt", "dress", "wear"] },
  { emoji: "💊", keywords: ["medicine", "health", "doctor", "sick"] },
  { emoji: "🏥", keywords: ["hospital", "doctor", "health", "sick"] },
  { emoji: "📍", keywords: ["location", "place", "map", "where"] },
  { emoji: "⏳", keywords: ["wait", "time", "delay", "future"] },
  { emoji: "✈️", keywords: ["check in", "зареєструватися", "airport", "travel"] },
  { emoji: "🧭", keywords: ["figure out", "розібратися", "understand"] },
  { emoji: "🌅", keywords: ["fresh start", "новий початок", "start"] },
  { emoji: "🎫", keywords: ["boarding pass", "посадковий талон", "ticket"] },
  { emoji: "🛎️", keywords: ["book a room", "забронювати номер", "hotel", "room"] },
  { emoji: "🗺️", keywords: ["get lost", "загубитися", "lost"] },
  { emoji: "🚆", keywords: ["round trip", "поїздка", "train", "travel"] },
  { emoji: "💬", keywords: ["keep in touch", "зв'язок", "communication"] },
  { emoji: "⏰", keywords: ["deadline", "термін", "time"] },
  { emoji: "📅", keywords: ["schedule", "meeting", "зустріч", "calendar"] },
  { emoji: "📚", keywords: ["workload", "навантаження", "work"] },
  { emoji: "📝", keywords: ["notes", "нотатки", "write"] },
  { emoji: "📈", keywords: ["promoted", "підвищення", "career"] },
  { emoji: "🍎", keywords: ["snack", "перекус", "food", "apple"] },
  { emoji: "😋", keywords: ["delicious", "смачний", "tasty"] },
  { emoji: "🥡", keywords: ["takeaway", "замовити їжу", "food"] },
  { emoji: "🥕", keywords: ["ingredients", "інгредієнти", "recipe"] },
  { emoji: "🌶️", keywords: ["spicy", "гострий", "pepper"] },
  { emoji: "🧾", keywords: ["bill", "рахунок", "pay"] },
  { emoji: "🏠", keywords: ["tidy", "прибрати", "house", "home"] },
  { emoji: "🧺", keywords: ["laundry", "прати", "wash"] },
  { emoji: "🛋️", keywords: ["living room", "вітальня", "sofa"] },
  { emoji: "💡", keywords: ["turn on", "увімкнути", "light"] },
  { emoji: "🥛", keywords: ["run out", "закінчитися", "milk"] },
  { emoji: "🪴", keywords: ["make yourself at home", "почувайся як удома", "home"] },
  { emoji: "🐾", keywords: ["look after", "піклуватися", "care", "animal"] },
  { emoji: "🔎", keywords: ["find out", "дізнатися", "discover"] },
  { emoji: "🏳️", keywords: ["give up", "здатися", "quit"] },
  { emoji: "📌", keywords: ["put off", "відкладати", "delay"] },
  { emoji: "📰", keywords: ["come across", "натрапити", "article"] },
  { emoji: "✅", keywords: ["work out", "скластися", "success"] },
];

function rankEmojis(entries: EmojiEntry[], text: string, limit: number): string[] {
  const query = text.trim().toLocaleLowerCase();
  if (!query) return emojiEntries.slice(0, limit).map((entry) => entry.emoji);
  const words = query.split(/\s+/).filter(Boolean);
  const ranked = entries
    .map((entry, index) => {
      const score = entry.keywords.reduce((total, keyword) => {
        const normalized = keyword.toLocaleLowerCase();
        return total + (query.includes(normalized) || words.some((word) => normalized.includes(word)) ? 2 : 0);
      }, 0);
      return { entry, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .filter(({ score }) => score > 0)
    .slice(0, limit)
    .map(({ entry }) => entry.emoji);

  return ranked;
}

const remoteEmojiIndexUrl = "https://emojibooks.com/data/emoji-index.v1.json";
let fullEmojiEntries: EmojiEntry[] | null = null;
let fullEmojiLoad: Promise<EmojiEntry[]> | null = null;

export function suggestEmojis(text: string, limit = 12): string[] {
  return rankEmojis(emojiEntries, text, limit);
}

export async function suggestEmojisFromFullIndex(text: string, limit = 12): Promise<string[]> {
  if (!fullEmojiLoad) {
    fullEmojiLoad = fetch(remoteEmojiIndexUrl, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Emoji index request failed: ${response.status}`);
        return response.json() as Promise<{ rows?: Array<[string, string, string, string, string]> }>;
      })
      .then((payload) => {
        const seen = new Set<string>();
        fullEmojiEntries = (payload.rows ?? [])
          .map((row) => ({ emoji: row[0], keywords: `${row[2] ?? ""}|${row[4] ?? ""}`.split("|") }))
          .filter((entry) => entry.emoji && !seen.has(entry.emoji) && seen.add(entry.emoji));
        return fullEmojiEntries;
      })
      .catch(() => emojiEntries);
  }

  const entries = fullEmojiEntries ?? await fullEmojiLoad;
  return rankEmojis(entries, text, limit);
}
