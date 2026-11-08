import type { Direction, Progress } from "./data";

const FAILURE_DELAY_MINUTES = 10;
const MIN_EASE = 1.3;
const MAX_EASE = 2.8;

const addDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const addMinutes = (minutes: number) => new Date(Date.now() + minutes * 60000).toISOString();

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function applyReview(current: Progress | undefined, cardId: string, direction: Direction, known: boolean, now = new Date()): Progress {
  const today = localDateKey(now);
  const item = current ?? {
    cardId,
    direction,
    successCount: 0,
    failureCount: 0,
    dueAt: now.toISOString(),
    learned: false,
    totalReviews: 0,
    totalKnown: 0,
    totalUnknown: 0,
    sessionKnown: 0,
    sessionUnknown: 0,
    successStreak: 0,
    easeFactor: 2.3,
    intervalDays: 0,
  };
  const sameSession = item.lastSessionDate === today;
  const sessionKnown = (sameSession ? item.sessionKnown : 0) + (known ? 1 : 0);
  const sessionUnknown = (sameSession ? item.sessionUnknown : 0) + (known ? 0 : 1);
  const totalKnown = item.totalKnown + (known ? 1 : 0);
  const totalUnknown = item.totalUnknown + (known ? 0 : 1);
  const totalReviews = item.totalReviews + 1;
  const successStreak = known ? item.successStreak + 1 : 0;
  const easeFactor = Math.min(MAX_EASE, Math.max(MIN_EASE, item.easeFactor + (known ? 0.1 : -0.2)));
  const intervalDays = known
    ? Math.max(1, Math.round(Math.max(item.intervalDays, 1) * easeFactor))
    : Math.max(0, Math.round(item.intervalDays * 0.25));
  const dueAt = known ? addDays(intervalDays || 1) : addMinutes(FAILURE_DELAY_MINUTES);

  return {
    ...item,
    cardId,
    direction,
    successCount: totalKnown,
    failureCount: totalUnknown,
    dueAt,
    learned: item.learned,
    lastReviewedAt: now.toISOString(),
    totalReviews,
    totalKnown,
    totalUnknown,
    sessionKnown,
    sessionUnknown,
    successStreak,
    easeFactor,
    intervalDays,
    lastSessionDate: today,
  };
}

export function isDue(item: Progress, now = new Date()) {
  return new Date(item.dueAt).getTime() <= now.getTime();
}
