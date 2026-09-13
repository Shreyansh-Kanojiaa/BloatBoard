import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAppForm } from "./validate";

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

test("valid form parses and trims", () => {
  const r = parseAppForm(fd({ name: "  Slack ", category: "electron", ram_mb: "1200", description: "", source_url: "" }));
  assert.deepEqual(r, {
    data: { name: "Slack", category: "electron", ram_mb: 1200, description: null, source_url: null },
  });
});

test("rejects bad fields", () => {
  const r = parseAppForm(fd({ name: "", category: "rust", ram_mb: "-5", source_url: "ftp://x" }));
  assert.ok("errors" in r);
  assert.deepEqual(Object.keys(r.errors).sort(), ["category", "name", "ram_mb", "source_url"]);
});

test("rejects fractional RAM", () => {
  const r = parseAppForm(fd({ name: "X", category: "other", ram_mb: "1.5" }));
  assert.ok("errors" in r && r.errors.ram_mb);
});
