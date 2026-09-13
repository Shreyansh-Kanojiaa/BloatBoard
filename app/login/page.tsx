import GitHubButton from "@/components/GitHubButton";
import { getUser } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/", error } = await searchParams;
  if (await getUser()) redirect(next.startsWith("/") ? next : "/");

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="nb-card bg-violet p-6">
        <h1 className="font-display text-3xl uppercase">Log in</h1>
        <p className="mt-2 font-semibold">Browsing is free. Voting and snitching need a GitHub account.</p>
      </div>
      {error && (
        <div className="border-3 border-ink bg-pink p-3 text-sm" role="alert">
          <p className="font-bold">Login didn&apos;t go through.</p>
          <p className="mt-1 font-medium">{error}</p>
        </div>
      )}
      <GitHubButton next={next} />
    </div>
  );
}
