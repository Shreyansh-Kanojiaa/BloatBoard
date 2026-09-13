import Link from "next/link";
import { getUser } from "@/lib/queries";
import { signOut } from "@/lib/actions";

export default async function Header() {
  const user = await getUser();
  const meta = (user?.user_metadata ?? {}) as { user_name?: string; avatar_url?: string };

  return (
    <header className="border-b-3 border-ink bg-yellow">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
          Bloat<span className="bg-ink px-1 text-yellow">Board</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 text-sm">
          <Link href="/" className="nb-btn bg-white px-3 py-1.5">
            Board
          </Link>
          <Link href="/submit" className="nb-btn bg-lime px-3 py-1.5">
            + Snitch
          </Link>
          {user ? (
            <>
              <Link href="/profile" className="nb-btn flex items-center gap-2 bg-white px-2 py-1">
                {meta.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={meta.avatar_url} alt="" className="size-6 border-2 border-ink" />
                )}
                <span className="hidden sm:inline">{meta.user_name ?? "me"}</span>
              </Link>
              <form action={signOut}>
                <button className="nb-btn bg-pink px-3 py-1.5">Out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="nb-btn bg-cyan px-3 py-1.5">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
