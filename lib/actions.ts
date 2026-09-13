"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { parseAppForm, type FieldErrors } from "@/lib/validate";

export type FormState = {
  error?: string;
  fieldErrors?: FieldErrors;
  /** Set when an app with the same name exists and the user hasn't confirmed. */
  duplicate?: { id: string; name: string };
};

export async function submitApp(_prev: FormState, fd: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/submit");

  const parsed = parseAppForm(fd);
  if ("errors" in parsed) return { fieldErrors: parsed.errors };

  if (fd.get("confirm_duplicate") !== "on") {
    const { data: dupe } = await supabase
      .from("apps")
      .select("id, name")
      .ilike("name", parsed.data.name)
      .limit(1)
      .maybeSingle();
    if (dupe) return { duplicate: dupe };
  }

  const meta = auth.user.user_metadata as { user_name?: string; full_name?: string };
  const { data, error } = await supabase
    .from("apps")
    .insert({
      ...parsed.data,
      submitted_by: auth.user.id,
      submitter_name: meta.user_name ?? meta.full_name ?? null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/");
  redirect(`/app/${data.id}`);
}

export async function updateApp(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const supabase = await createClient();
  const parsed = parseAppForm(fd);
  if ("errors" in parsed) return { fieldErrors: parsed.errors };

  // RLS restricts the update to rows where submitted_by = auth.uid(); 0 rows means not owner.
  const { data, error } = await supabase.from("apps").update(parsed.data).eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "You can only edit your own submissions." };

  revalidatePath("/");
  revalidatePath(`/app/${id}`);
  redirect(`/app/${id}`);
}

export async function deleteApp(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("apps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
