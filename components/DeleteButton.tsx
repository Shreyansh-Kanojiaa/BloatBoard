"use client";

import { useState, useTransition } from "react";
import { deleteApp } from "@/lib/actions";

// Two-click confirm instead of a modal.
export default function DeleteButton({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className="nb-btn bg-white px-3 py-1.5 text-xs">
        Delete
      </button>
    );
  }
  return (
    <span className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => deleteApp(id))}
        className="nb-btn bg-red-500 px-3 py-1.5 text-xs text-white"
      >
        {pending ? "Deleting…" : "Really delete"}
      </button>
      <button type="button" onClick={() => setArmed(false)} className="nb-btn bg-white px-3 py-1.5 text-xs">
        Nope
      </button>
    </span>
  );
}
