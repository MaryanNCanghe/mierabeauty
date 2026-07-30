// One-off: backfills products.texture for the 39 live bundle/clip-in
// products created before that column existed. Texture-category products
// (Straight, Deep Wave, Body Wave, Loose Deep Curl, Natural Wave) get their
// own category's slug; Clip-Ins get 'straight' (matches the price
// catalogue's basis for Clip-In pricing and the real photos).
//
// Requires the products.texture column to already exist — run the
// `alter table products add column if not exists texture text;` block from
// supabase-schema.sql once in the Supabase SQL Editor first.
//
// Usage: node scripts/backfill-texture.js
// Safe to re-run — always sets texture from current category tags.

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

// category slug -> texture value
const CATEGORY_TO_TEXTURE = {
  straight: "straight",
  "deep-wave": "deep-wave",
  "body-wave": "body-wave",
  "loose-deep-curl": "loose-deep-curl",
  "natural-wave": "natural-wave",
  "clip-ins": "straight", // clip-in sets photographed are straight-textured
};

async function main() {
  const slugs = Object.keys(CATEGORY_TO_TEXTURE);
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug").in("slug", slugs);
  if (catErr) throw new Error(`Load categories failed: ${catErr.message}`);

  let total = 0;
  for (const cat of cats) {
    const texture = CATEGORY_TO_TEXTURE[cat.slug];

    const { data: links, error: linkErr } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", cat.id);
    if (linkErr) throw new Error(`Load products for '${cat.slug}' failed: ${linkErr.message}`);

    const productIds = links.map((l) => l.product_id);
    if (productIds.length === 0) continue;

    const { error: updErr } = await supabase.from("products").update({ texture }).in("id", productIds);
    if (updErr) throw new Error(`Update texture failed for '${cat.slug}': ${updErr.message}`);

    console.log(`✅  [${cat.slug}] texture='${texture}' set on ${productIds.length} product(s)`);
    total += productIds.length;
  }

  console.log(`Done. ${total} products updated.`);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
