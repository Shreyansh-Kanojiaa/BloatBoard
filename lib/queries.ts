import { createClient } from "@/lib/supabaseServer";
import type { AppScore, VoteValue } from "@/lib/types";

export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getLeaderboard(): Promise<AppScore[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_scores")
    .select("*")
    .order("score", { ascending: false })
    .order("ram_mb", { ascending: false });
  if (error) throw new Error(error.message);
  return data as AppScore[];
}

export async function getApp(id: string): Promise<AppScore | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_scores").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as AppScore | null;
}

export async function getMyApps(userId: string): Promise<AppScore[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_scores")
    .select("*")
    .eq("submitted_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as AppScore[];
}

/** Map of app_id -> the current user's vote value. Empty when logged out. */
export async function getMyVotes(userId: string | undefined): Promise<Record<string, VoteValue>> {
  if (!userId) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.from("votes").select("app_id, value").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((v) => [v.app_id, v.value as VoteValue]));
}
