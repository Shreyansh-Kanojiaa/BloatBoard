import type { SupabaseClient } from "@supabase/supabase-js";
import type { VoteRow } from "@/lib/types";

/**
 * Subscribe to vote changes and report score deltas per app.
 * Requires `replica identity full` on votes so UPDATE/DELETE carry the old value.
 */
export function subscribeVotes(
  supabase: SupabaseClient,
  onDelta: (appId: string, delta: number, userId: string) => void,
  filter?: string,
  onStatus?: (live: boolean) => void,
) {
  const channel = supabase
    .channel(`votes:${filter ?? "all"}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "votes", ...(filter ? { filter } : {}) },
      (payload) => {
        const next = payload.new as Partial<VoteRow>;
        const prev = payload.old as Partial<VoteRow>;
        const row = payload.eventType === "DELETE" ? prev : next;
        if (!row.app_id || !row.user_id) return;
        const delta = (next.value ?? 0) - (prev.value ?? 0);
        if (delta !== 0) onDelta(row.app_id, delta, row.user_id);
      },
    )
    .subscribe((status) => onStatus?.(status === "SUBSCRIBED"));
  return () => {
    supabase.removeChannel(channel);
  };
}
