import { notFound, redirect } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";
import { updateApp } from "@/lib/actions";
import { getApp, getUser } from "@/lib/queries";

export default async function EditApp({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [app, user] = await Promise.all([getApp(id), getUser()]);
  if (!app) notFound();
  if (!user) redirect(`/login?next=/app/${id}/edit`);
  if (user.id !== app.submitted_by) redirect(`/app/${id}`);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="font-display text-3xl uppercase sm:text-4xl">Edit {app.name}</h1>
      <SubmitForm action={updateApp.bind(null, id)} initial={app} submitLabel="Save changes" />
    </div>
  );
}
