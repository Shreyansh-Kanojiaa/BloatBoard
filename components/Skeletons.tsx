function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse border-2 border-ink/20 bg-ink/10 ${className}`} />;
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading leaderboard">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-8 w-20" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="nb-card flex items-center gap-4 p-4">
          <Bar className="size-10" />
          <div className="flex-1 space-y-2">
            <Bar className="h-5 w-1/3" />
            <Bar className="h-3 w-2/3" />
          </div>
          <Bar className="h-9 w-28" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="nb-card space-y-4 p-6" aria-busy="true" aria-label="Loading">
      <Bar className="h-10 w-1/2" />
      <Bar className="h-4 w-1/4" />
      <Bar className="h-20 w-full" />
      <Bar className="h-14 w-48" />
    </div>
  );
}
