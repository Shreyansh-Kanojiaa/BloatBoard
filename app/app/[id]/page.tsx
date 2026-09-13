import Link from "next/link";
import { notFound } from "next/navigation";
import AppDetail from "@/components/AppDetail";
import DeleteButton from "@/components/DeleteButton";
import { getApp, getMyVotes, getUser } from "@/lib/queries";
import { CATEGORY_COLOR, CATEGORY_LABEL } from "@/lib/types";

export default async function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [app, user] = await Promise.all([getApp(id), getUser()]);
  if (!app) notFound();
  const votes = await getMyVotes(user?.id);
  const isOwner = !!user && user.id === app.submitted_by;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/" className="text-sm font-extrabold uppercase underline">
        ← Leaderboard
      </Link>

      <article className="nb-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className={`border-2 border-ink px-1.5 text-[10px] font-extrabold uppercase ${CATEGORY_COLOR[app.category]}`}>
              {CATEGORY_LABEL[app.category]}
            </span>
            <h1 className="font-display mt-2 text-3xl uppercase leading-none sm:text-5xl">{app.name}</h1>
          </div>
          <AppDetail appId={app.id} initialScore={app.score} initialVote={votes[app.id] ?? null} userId={user?.id} />
        </div>

        <div className="mt-6 inline-block border-3 border-ink bg-yellow px-4 py-2">
          <span className="font-display text-4xl tabular-nums">{app.ram_mb.toLocaleString()}</span>
          <span className="ml-1 text-xs font-extrabold uppercase">MB (self-reported)</span>
        </div>

        {app.description && <p className="mt-5 text-lg font-medium">{app.description}</p>}

        <dl className="mt-6 space-y-1 text-sm font-semibold text-ink/70">
          <div>
            <dt className="inline">Submitted by </dt>
            <dd className="inline text-ink">{app.submitter_name ?? "anonymous"}</dd>
            <span> · {new Date(app.created_at).toLocaleDateString()}</span>
          </div>
          {app.source_url && (
            <div>
              <dt className="inline">Proof: </dt>
              <dd className="inline">
                <a href={app.source_url} target="_blank" rel="noopener noreferrer" className="break-all text-ink underline">
                  {app.source_url}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {isOwner && (
          <div className="mt-6 flex items-center gap-2 border-t-3 border-ink pt-4">
            <Link href={`/app/${app.id}/edit`} className="nb-btn bg-cyan px-3 py-1.5 text-xs">
              Edit
            </Link>
            <DeleteButton id={app.id} />
          </div>
        )}
      </article>
    </div>
  );
}
