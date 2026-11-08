import { getSupabaseBrowserClient } from "./supabase-browser";

const ACTIVE_THEMES_KEY = "wordly-active-themes-v1";

export async function loadActiveThemeIds(allThemeIds: string[]) {
  let localIds: string[] | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ACTIVE_THEMES_KEY);
      localIds = stored === null ? null : JSON.parse(stored);
    } catch {
      localIds = null;
    }
  }

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data, error } = await supabase.from("user_themes").select("theme_id,enabled").eq("user_id", userData.user.id);
      if (!error && data?.length) {
        const ids = data.filter((item) => item.enabled).map((item) => item.theme_id);
        if (typeof window !== "undefined") localStorage.setItem(ACTIVE_THEMES_KEY, JSON.stringify(ids));
        return ids;
      }
    }
  }

  return localIds ?? allThemeIds;
}

export async function saveActiveThemeIds(ids: string[]) {
  if (typeof window !== "undefined") localStorage.setItem(ACTIVE_THEMES_KEY, JSON.stringify(ids));
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  await supabase.from("user_themes").upsert(ids.map((themeId) => ({ user_id: userData.user.id, theme_id: themeId, enabled: true })), { onConflict: "user_id,theme_id" });
  const disabledIds = await supabase.from("themes").select("id");
  if (!disabledIds.error) {
    await supabase.from("user_themes").upsert((disabledIds.data ?? []).filter((theme) => !ids.includes(theme.id)).map((theme) => ({ user_id: userData.user.id, theme_id: theme.id, enabled: false })), { onConflict: "user_id,theme_id" });
  }
}
