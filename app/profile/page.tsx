import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { getMyApps, getUser } from "@/lib/queries";
import { CATEGORY_LABEL } from "@/lib/types";

export default async function Profile() {
  const user = await getUser();
  if (!user) redirect("/login?next=/profile");
  const apps = await getMyApps(user.id);
  const meta = user.user_metadata as { user_name?: string };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="font-display text-3xl uppercase sm:text-4xl">{meta.user_name ?? "Your"} submissions</h1>
      {apps.length === 0 ? (
        <div className="nb-card bg-yellow p-8 text-center font-semibold">
          You haven&apos;t snitched on anything yet.{" "}
          <Link href="/submit" className="underline">
            Fix that.
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id} className="nb-card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/app/${a.id}`} className="font-display text-lg hover:underline">
                  {a.name}
                </Link>
                <p className="text-xs font-bold uppercase text-ink/60">
                  {CATEGORY_LABEL[a.category]} · {a.ram_mb.toLocaleString()} MB · score {a.score}
                </p>
              </div>
              <Link href={`/app/${a.id}/edit`} className="nb-btn bg-cyan px-3 py-1.5 text-xs">
                Edit
              </Link>
              <DeleteButton id={a.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
