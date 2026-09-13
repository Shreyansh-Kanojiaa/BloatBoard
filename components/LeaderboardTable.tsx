"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import VoteButtons from "@/components/VoteButtons";
import { createClient } from "@/lib/supabaseClient";
import { subscribeVotes } from "@/lib/realtime";
import { CATEGORY_COLOR, CATEGORY_LABEL, type AppScore, type Category, type VoteValue } from "@/lib/types";

type Props = {
  initialApps: AppScore[];
  initialVotes: Record<string, VoteValue>;
  userId: string | undefined;
};

const byScore = (a: AppScore, b: AppScore) => b.score - a.score || b.ram_mb - a.ram_mb;

export default function LeaderboardTable({ initialApps, initialVotes, userId }: Props) {
  const [apps, setApps] = useState(initialApps);
  const [votes, setVotes] = useState(initialVotes);
  const [category, setCategory] = useState<Category | null>(null);
  const [live, setLive] = useState(false);

  const bump = (appId: string, delta: number) =>
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, score: a.score + delta } : a)).sort(byScore));

  useEffect(() => {
    // Skip our own votes: they were already applied optimistically.
    return subscribeVotes(
      createClient(),
      (appId, delta, voter) => {
        if (voter !== userId) bump(appId, delta);
      },
      undefined,
      setLive,
    );
  }, [userId]);

  const visible = category ? apps.filter((a) => a.category === category) : apps;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryFilter value={category} onChange={setCategory} />
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase">
          <span className={`inline-block size-2.5 border-2 border-ink ${live ? "bg-lime" : "bg-white"}`} />
          {live ? "Live" : "Connecting"}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="nb-card bg-yellow p-10 text-center">
          <p className="font-display text-2xl uppercase">Nothing here yet</p>
          <p className="mt-2 font-semibold">
            {category ? "No apps in this category." : "No apps yet. Be the first to snitch on Slack."}
          </p>
          <Link href="/submit" className="nb-btn mt-5 inline-block bg-lime px-4 py-2">
            Submit one
          </Link>
        </div>
      ) : (
        <ol className="space-y-3">
          {visible.map((app, i) => (
            <li key={app.id} className="nb-card flex items-center gap-3 p-3 sm:gap-5 sm:p-4">
              <span className="font-display w-8 shrink-0 text-center text-xl text-ink/60 sm:text-2xl">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link href={`/app/${app.id}`} className="font-display truncate text-lg hover:underline sm:text-xl">
                    {app.name}
                  </Link>
                  <span className={`border-2 border-ink px-1.5 text-[10px] font-extrabold uppercase ${CATEGORY_COLOR[app.category]}`}>
                    {CATEGORY_LABEL[app.category]}
                  </span>
                </div>
                {app.description && <p className="mt-0.5 truncate text-sm font-medium text-ink/70">{app.description}</p>}
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <div className="font-display text-xl tabular-nums">{app.ram_mb.toLocaleString()}</div>
                <div className="text-[10px] font-extrabold uppercase">MB</div>
              </div>
              <VoteButtons
                appId={app.id}
                score={app.score}
                myVote={votes[app.id] ?? null}
                userId={userId}
                onVote={(delta, vote) => {
                  bump(app.id, delta);
                  setVotes((v) => ({ ...v, [app.id]: vote as VoteValue }));
                }}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
