import { loadProgress, type Direction, type Progress } from "./data";
import { getSupabaseBrowserClient } from "./supabase-browser";
export async function syncReview(userId:string, cardId:string, direction:Direction, known:boolean, progress:Progress) { const supabase=getSupabaseBrowserClient(); if(!supabase)return {synced:false}; const {error:progressError}=await supabase.from("user_card_progress").upsert({user_id:userId,card_id:cardId,direction,success_count:progress.successCount,failure_count:progress.failureCount,due_at:progress.dueAt,learned:progress.learned,last_reviewed_at:progress.lastReviewedAt},{onConflict:"user_id,card_id,direction"}); if(progressError)throw progressError; const {error:eventError}=await supabase.from("review_events").insert({user_id:userId,card_id:cardId,direction,known}); if(eventError)throw eventError; return {synced:true}; }

export async function migrateLocalProgress(userId:string) {
  const supabase = getSupabaseBrowserClient();
  const localProgress = loadProgress();
  if (!supabase || localProgress.length === 0) return { migrated: 0 };

  const rows = localProgress.map((progress) => ({
    user_id: userId,
    card_id: progress.cardId,
    direction: progress.direction,
    success_count: progress.successCount,
    failure_count: progress.failureCount,
    due_at: progress.dueAt,
    learned: progress.learned,
    last_reviewed_at: progress.lastReviewedAt ?? null,
  }));

  const { error } = await supabase
    .from("user_card_progress")
    .upsert(rows, { onConflict: "user_id,card_id,direction" });

  if (error) throw error;
  return { migrated: rows.length };
}
