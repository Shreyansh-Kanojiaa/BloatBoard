"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="nb-card bg-yellow p-8 text-center">
      <p className="font-display text-3xl uppercase">Something broke</p>
      <p className="mt-2 font-semibold text-ink/70">
        {/^fetch failed|network/i.test(error.message) ? "Couldn't reach the server. Check your connection." : error.message}
      </p>
      <button onClick={reset} className="nb-btn mt-5 bg-white px-4 py-2">
        Try again
      </button>
    </div>
  );
}
