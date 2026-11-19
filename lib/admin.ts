import { getSupabaseBrowserClient } from "./supabase-browser";

export type AdminAction = { id: number; action: "archive_card" | "restore_card"; cardId: string | null; createdAt: string };

export async function loadAdminStatus() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

export async function loadAdminActions(): Promise<AdminAction[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("admin_actions").select("id,action,card_id,created_at").order("created_at", { ascending: false }).limit(30);
  if (error) return [];
  return (data ?? []).map((item) => ({ id: item.id, action: item.action as AdminAction["action"], cardId: item.card_id, createdAt: item.created_at }));
}
