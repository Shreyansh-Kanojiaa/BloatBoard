import SubmitForm from "@/components/SubmitForm";
import { submitApp } from "@/lib/actions";
import { getUser } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function Submit() {
  if (!(await getUser())) redirect("/login?next=/submit");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="font-display text-3xl uppercase sm:text-4xl">Snitch on an app</h1>
      <SubmitForm action={submitApp} submitLabel="Add to the board" />
    </div>
  );
}
