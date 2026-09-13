"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function GitHubButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={login} disabled={busy} className="nb-btn w-full bg-ink px-6 py-4 text-lg text-paper">
        {busy ? "Redirecting…" : "Continue with GitHub"}
      </button>
      {error && <p className="text-sm font-bold text-red-700">{error}</p>}
    </div>
  );
}
