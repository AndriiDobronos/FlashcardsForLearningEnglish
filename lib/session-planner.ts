import type { Card, Direction, Progress } from "./data";
import { isDue } from "./scheduler";

export const SESSION_TARGET = 120;
export const SESSION_UNIQUE_LIMIT = 30;
export const REPEAT_LAG = 9;

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function isCompletedToday(progress: Progress[], cardId: string, date = new Date()) {
  const today = localDateKey(date);
  const directions: Direction[] = ["en-uk", "uk-en"];
  return directions.every((direction) => {
    const item = progress.find((entry) => entry.cardId === cardId && entry.direction === direction);
    return item?.lastSessionDate === today && item.sessionKnown >= 2;
  });
}

function priority(card: Card, progress: Progress[], now = new Date()) {
  const entries = progress.filter((entry) => entry.cardId === card.id);
  if (!entries.length) return 1_000_000;

  const overdueMinutes = entries.reduce((total, entry) => {
    const overdue = Math.max(0, now.getTime() - new Date(entry.dueAt).getTime());
    return total + overdue / 60000;
  }, 0);
  const failures = entries.reduce((total, entry) => total + entry.totalUnknown, 0);
  const weakestEase = Math.min(...entries.map((entry) => entry.easeFactor));
  return overdueMinutes + failures * 100 + (3 - weakestEase) * 50;
}

export function buildSessionQueue(cards: Card[], progress: Progress[], now = new Date()) {
  return cards
    .filter((card) => {
      if (isCompletedToday(progress, card.id, now)) return false;
      const entries = progress.filter((entry) => entry.cardId === card.id);
      const continuingToday = entries.some((entry) => entry.lastSessionDate === localDateKey(now));
      if (continuingToday) return true;
      return entries.length === 0 || entries.some((entry) => !entry.learned && isDue(entry));
    })
    .sort((left, right) => priority(right, progress, now) - priority(left, progress, now))
    .slice(0, SESSION_UNIQUE_LIMIT);
}

export function nextDirection(progress: Progress[], cardId: string, date = new Date()): Direction {
  const today = localDateKey(date);
  const direct = progress.find((entry) => entry.cardId === cardId && entry.direction === "en-uk");
  if (direct?.lastSessionDate === today && direct.sessionKnown >= 2) return "uk-en";
  return "en-uk";
}

export function insertForLater(queue: Card[], card: Card) {
  const position = Math.min(REPEAT_LAG, queue.length);
  return [...queue.slice(0, position), card, ...queue.slice(position)];
}
