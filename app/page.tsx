import LeaderboardTable from "@/components/LeaderboardTable";
import { getLeaderboard, getMyVotes, getUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  const [apps, votes] = await Promise.all([getLeaderboard(), getMyVotes(user?.id)]);

  return (
    <div className="space-y-6">
      <div className="nb-card bg-pink p-5 sm:p-7">
        <h1 className="font-display text-3xl uppercase leading-none sm:text-5xl">
          Which app eats the most RAM for what it does?
        </h1>
        <p className="mt-3 max-w-xl font-semibold">
          Crowdsourced, votable, self-reported. Upvote the offenders. Scores update live.
        </p>
      </div>
      <LeaderboardTable initialApps={apps} initialVotes={votes} userId={user?.id} />
    </div>
  );
}
