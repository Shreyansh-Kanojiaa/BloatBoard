export const CATEGORIES = ["electron", "java", "native", "browser-tab", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  electron: "Electron",
  java: "Java",
  native: "Native",
  "browser-tab": "Browser tab",
  other: "Other",
};

/** Tailwind bg class per category; used by both server and client components. */
export const CATEGORY_COLOR: Record<Category, string> = {
  electron: "bg-pink",
  java: "bg-orange",
  native: "bg-lime",
  "browser-tab": "bg-cyan",
  other: "bg-violet",
};

export type AppRow = {
  id: string;
  name: string;
  category: Category;
  ram_mb: number;
  description: string | null;
  source_url: string | null;
  submitted_by: string | null;
  submitter_name: string | null;
  created_at: string;
};

export type AppScore = AppRow & { score: number; vote_count: number };

export type VoteValue = 1 | -1;
export type VoteRow = { id: string; app_id: string; user_id: string; value: VoteValue };
