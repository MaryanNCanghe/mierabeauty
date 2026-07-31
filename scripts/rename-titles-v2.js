// One-off:
//   1. Renames the "clip-ins" category from "Premium Express Clip Ins" back
//      to "Clip-Ins".
//   2. Renames every product title: swaps the " in " separator for " - ",
//      and (for Clip-In products specifically) swaps the "Premium Express
//      Clip Ins" prefix for "Clip-Ins".
//
// Usage: node scripts/rename-titles-v2.js
// Safe to re-run — only rewrites rows that still need it.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const ROOT = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, {
  db: { schema: "public" },
  auth: { persistSession: false },
});

async function renameClipInsCategory() {
  const { error } = await supabase.from("categories").update({ name: "Clip-Ins" }).eq("slug", "clip-ins");
  if (error) throw new Error(`Rename 'clip-ins' category failed: ${error.message}`);
  console.log(`✅  'clip-ins' category → "Clip-Ins"`);
}

async function renameProductTitles() {
  const { data: products, error } = await supabase.from("products").select("id, name");
  if (error) throw new Error(`Load products failed: ${error.message}`);

  let updated = 0;
  for (const p of products) {
    const newName = p.name.replace(/^Premium Express Clip Ins/, "Clip-Ins").replace(/ in /g, " - ");
    if (newName === p.name) continue;
    const { error: updateErr } = await supabase.from("products").update({ name: newName }).eq("id", p.id);
    if (updateErr) throw new Error(`Rename product ${p.id} failed: ${updateErr.message}`);
    updated++;
  }
  console.log(`✅  Renamed ${updated} product title(s)`);
}

async function main() {
  await renameClipInsCategory();
  await renameProductTitles();
  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
