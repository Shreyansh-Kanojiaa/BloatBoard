"use client";

import { useEffect, useState } from "react";
import VoteButtons from "@/components/VoteButtons";
import { createClient } from "@/lib/supabaseClient";
import { subscribeVotes } from "@/lib/realtime";
import type { VoteValue } from "@/lib/types";

// Live score + vote controls for a single app.
export default function AppDetail({
  appId,
  initialScore,
  initialVote,
  userId,
}: {
  appId: string;
  initialScore: number;
  initialVote: VoteValue | null;
  userId: string | undefined;
}) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState(initialVote);

  useEffect(() => {
    return subscribeVotes(
      createClient(),
      (_id, delta, voter) => {
        if (voter !== userId) setScore((s) => s + delta);
      },
      `app_id=eq.${appId}`,
    );
  }, [appId, userId]);

  return (
    <VoteButtons
      appId={appId}
      score={score}
      myVote={vote}
      userId={userId}
      size="lg"
      onVote={(delta, v) => {
        setScore((s) => s + delta);
        setVote(v);
      }}
    />
  );
}
