"use client";

import { CATEGORIES, CATEGORY_COLOR, CATEGORY_LABEL, type Category } from "@/lib/types";

export default function CategoryFilter({
  value,
  onChange,
}: {
  value: Category | null;
  onChange: (c: Category | null) => void;
}) {
  const chip = (c: Category | null, label: string, color: string) => {
    const active = value === c;
    return (
      <button
        key={label}
        type="button"
        onClick={() => onChange(c)}
        aria-pressed={active}
        className={`nb-btn px-3 py-1 text-xs ${active ? "bg-ink text-paper" : color}`}
      >
        {label}
      </button>
    );
  };
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {chip(null, "All", "bg-white")}
      {CATEGORIES.map((c) => chip(c, CATEGORY_LABEL[c], CATEGORY_COLOR[c]))}
    </div>
  );
}
