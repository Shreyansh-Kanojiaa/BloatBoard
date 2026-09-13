"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/actions";
import { CATEGORIES, CATEGORY_LABEL, type AppRow } from "@/lib/types";
import type { FieldErrors } from "@/lib/validate";

type Props = {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Partial<AppRow>;
  submitLabel: string;
};

// Hoisted so React doesn't remount inputs on every keystroke.
function Field({
  name,
  label,
  hint,
  err,
  children,
}: {
  name: keyof FieldErrors;
  label: string;
  hint?: string;
  err: FieldErrors;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-extrabold uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint && !err[name] && <p className="mt-1 text-xs font-medium text-ink/60">{hint}</p>}
      {err[name] && (
        <p className="mt-1 text-xs font-bold text-red-700" role="alert">
          {err[name]}
        </p>
      )}
    </div>
  );
}

export default function SubmitForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="nb-card space-y-5 p-6">
      <Field err={err} name="name" label="App name">
        <input id="name" name="name" required maxLength={60} defaultValue={initial.name} className="nb-input" aria-invalid={!!err.name} placeholder="Slack" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field err={err} name="category" label="Category">
          <select id="category" name="category" required defaultValue={initial.category ?? "electron"} className="nb-input" aria-invalid={!!err.category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field err={err} name="ram_mb" label="Typical RAM (MB)" hint="Self-reported. Whole megabytes.">
          <input id="ram_mb" name="ram_mb" type="number" required min={1} max={1000000} step={1} defaultValue={initial.ram_mb} className="nb-input" aria-invalid={!!err.ram_mb} placeholder="1200" />
        </Field>
      </div>

      <Field err={err} name="description" label="Context (optional)" hint="What was it doing? e.g. “idle, one workspace open”">
        <textarea id="description" name="description" maxLength={280} rows={2} defaultValue={initial.description ?? ""} className="nb-input" aria-invalid={!!err.description} />
      </Field>

      <Field err={err} name="source_url" label="Proof link (optional)" hint="Screenshot, issue, anything.">
        <input id="source_url" name="source_url" type="url" defaultValue={initial.source_url ?? ""} className="nb-input" aria-invalid={!!err.source_url} placeholder="https://" />
      </Field>

      {state.duplicate && (
        <div className="border-3 border-ink bg-yellow p-4 text-sm font-semibold">
          <p>
            <Link href={`/app/${state.duplicate.id}`} className="underline">
              {state.duplicate.name}
            </Link>{" "}
            is already on the board.
          </p>
          <label className="mt-2 flex items-center gap-2">
            <input type="checkbox" name="confirm_duplicate" className="size-4 accent-ink" />
            Submit anyway (different config, different numbers)
          </label>
        </div>
      )}

      {state.error && (
        <p className="border-3 border-ink bg-pink p-3 text-sm font-bold" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="nb-btn w-full bg-lime px-6 py-3 text-lg">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
