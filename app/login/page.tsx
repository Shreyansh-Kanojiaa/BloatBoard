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
        <p className="border-3 border-ink bg-pink p-3 text-sm font-bold" role="alert">
          Login didn&apos;t go through. Try again.
        </p>
      )}
      <GitHubButton next={next} />
    </div>
  );
}
