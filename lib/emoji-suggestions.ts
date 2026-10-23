type EmojiEntry = { emoji: string; keywords: string[] };

const emojiEntries: EmojiEntry[] = [
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
  { emoji: "✈️", keywords: ["check in", "зареєструватися", "airport", "travel"] },
];

export function suggestEmojis(text: string, limit = 6): string[] {
  const query = text.trim().toLocaleLowerCase();
  if (!query) return emojiEntries.slice(0, limit).map((entry) => entry.emoji);
  const words = query.split(/\s+/).filter(Boolean);
  return emojiEntries
    .map((entry, index) => {
      const score = entry.keywords.reduce((total, keyword) => {
        const normalized = keyword.toLocaleLowerCase();
        return total + (query.includes(normalized) || words.some((word) => normalized.includes(word)) ? 2 : 0);
      }, 0);
      return { entry, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ entry }) => entry.emoji);
}
