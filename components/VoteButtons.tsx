"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import type { VoteValue } from "@/lib/types";

type Props = {
  appId: string;
  score: number;
  myVote: VoteValue | null;
  userId: string | undefined;
  /** Parent owns score/myVote state; called with the score delta and the new vote. */
  onVote: (delta: number, vote: VoteValue | null) => void;
  size?: "sm" | "lg";
};

export default function VoteButtons({ appId, score, myVote, userId, onVote, size = "sm" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cast(value: VoteValue) {
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    const next = myVote === value ? null : value; // clicking the active arrow retracts
    const delta = (next ?? 0) - (myVote ?? 0);
    const prevVote = myVote;
    setBusy(true);
    setError(null);
    onVote(delta, next); // optimistic

    const supabase = createClient();
    const { error } = next
      ? await supabase
          .from("votes")
          .upsert({ app_id: appId, user_id: userId, value: next }, { onConflict: "app_id,user_id" })
      : await supabase.from("votes").delete().eq("app_id", appId).eq("user_id", userId);

    if (error) {
      onVote(-delta, prevVote); // roll back
      setError("Vote failed. Try again.");
    }
    setBusy(false);
  }

  const btn = size === "lg" ? "size-14 text-2xl" : "size-9 text-base";
  const arrow = (value: VoteValue, label: string, glyph: string, activeBg: string) => (
    <button
      type="button"
      onClick={() => cast(value)}
      disabled={busy}
      aria-label={label}
      aria-pressed={myVote === value}
      className={`nb-btn ${btn} ${myVote === value ? `${activeBg} text-ink` : "bg-white"}`}
    >
      {glyph}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        {arrow(1, "Upvote", "▲", "bg-lime")}
        <span
          className={`font-display tabular-nums ${size === "lg" ? "min-w-16 text-3xl" : "min-w-9 text-lg"} text-center`}
        >
          {score}
        </span>
        {arrow(-1, "Downvote", "▼", "bg-pink")}
      </div>
      {error && <span className="text-xs font-bold text-red-700">{error}</span>}
    </div>
  );
}
