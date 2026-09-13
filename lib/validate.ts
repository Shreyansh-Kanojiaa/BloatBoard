import { CATEGORIES, type Category } from "@/lib/types";

export type AppInput = {
  name: string;
  category: Category;
  ram_mb: number;
  description: string | null;
  source_url: string | null;
};

export type FieldErrors = Partial<Record<keyof AppInput, string>>;

/** Server-side validation of the submit/edit form. Mirrors the DB check constraints. */
export function parseAppForm(fd: FormData): { data: AppInput } | { errors: FieldErrors } {
  const errors: FieldErrors = {};
  const str = (k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string).trim() : "");

  const name = str("name");
  if (name.length < 1 || name.length > 60) errors.name = "Name must be 1–60 characters.";

  const category = str("category") as Category;
  if (!CATEGORIES.includes(category)) errors.category = "Pick a category.";

  const ram_mb = Number(str("ram_mb"));
  if (!Number.isInteger(ram_mb) || ram_mb <= 0 || ram_mb > 1_000_000) {
    errors.ram_mb = "RAM must be a whole number of MB between 1 and 1,000,000.";
  }

  const description = str("description") || null;
  if (description && description.length > 280) errors.description = "Keep it under 280 characters.";

  const source_url = str("source_url") || null;
  if (source_url && !/^https?:\/\/\S+$/i.test(source_url)) errors.source_url = "Must be an http(s) URL.";

  if (Object.keys(errors).length) return { errors };
  return { data: { name, category, ram_mb, description, source_url } };
}
