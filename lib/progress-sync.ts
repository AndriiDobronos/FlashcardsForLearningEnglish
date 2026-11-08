import { loadProgress, type Direction, type Progress } from "./data";
import { getSupabaseBrowserClient } from "./supabase-browser";

const toRow = (userId: string, progress: Progress) => ({
  user_id: userId,
  card_id: progress.cardId,
  direction: progress.direction,
  success_count: progress.successCount,
  failure_count: progress.failureCount,
  due_at: progress.dueAt,
  learned: progress.learned,
  last_reviewed_at: progress.lastReviewedAt ?? null,
  total_reviews: progress.totalReviews,
  total_known: progress.totalKnown,
  total_unknown: progress.totalUnknown,
  session_known: progress.sessionKnown,
  session_unknown: progress.sessionUnknown,
  success_streak: progress.successStreak,
  ease_factor: progress.easeFactor,
  interval_days: progress.intervalDays,
  last_session_date: progress.lastSessionDate ?? null,
});

export async function syncReview(userId: string, cardId: string, direction: Direction, known: boolean, progress: Progress) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { synced: false };
  const { error: progressError } = await supabase.from("user_card_progress").upsert(toRow(userId, progress), { onConflict: "user_id,card_id,direction" });
  if (progressError) throw progressError;
  const { error: eventError } = await supabase.from("review_events").insert({ user_id: userId, card_id: cardId, direction, known });
  if (eventError) throw eventError;
  return { synced: true };
}

export async function migrateLocalProgress(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const localProgress = loadProgress();
  if (!supabase || localProgress.length === 0) return { migrated: 0 };
  const { error } = await supabase.from("user_card_progress").upsert(localProgress.map((progress) => toRow(userId, progress)), { onConflict: "user_id,card_id,direction" });
  if (error) throw error;
  return { migrated: localProgress.length };
}

export async function loadRemoteProgress(userId: string): Promise<Progress[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("user_card_progress").select("card_id,direction,success_count,failure_count,due_at,learned,last_reviewed_at,total_reviews,total_known,total_unknown,session_known,session_unknown,success_streak,ease_factor,interval_days,last_session_date").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((item) => ({
    cardId: item.card_id,
    direction: item.direction as Direction,
    successCount: item.success_count ?? item.total_known ?? 0,
    failureCount: item.failure_count ?? item.total_unknown ?? 0,
    dueAt: item.due_at,
    learned: item.learned ?? false,
    lastReviewedAt: item.last_reviewed_at ?? undefined,
    totalReviews: item.total_reviews ?? (item.success_count ?? 0) + (item.failure_count ?? 0),
    totalKnown: item.total_known ?? item.success_count ?? 0,
    totalUnknown: item.total_unknown ?? item.failure_count ?? 0,
    sessionKnown: item.session_known ?? 0,
    sessionUnknown: item.session_unknown ?? 0,
    successStreak: item.success_streak ?? 0,
    easeFactor: Number(item.ease_factor ?? 2.3),
    intervalDays: item.interval_days ?? 0,
    lastSessionDate: item.last_session_date ?? undefined,
  }));
}
