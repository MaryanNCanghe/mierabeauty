// One-off migration:
//   1. Premium category renames (tape-ins, clip-ins, hair-growth).
//   2. New "bundles" umbrella category; reparents the 7 texture categories
//      under it instead of directly under "hair".
//   3. Dual-tags every texture-tagged product with "bundles" too (fallback
//      image for the homepage tile + keeps cat=hair filtering complete).
//   4. Deletes the 2 products that incorrectly used a bundle photo as a
//      stand-in hero (clip-in-set-dark-brown, body-wave-bundle-blonde) —
//      reverting them to "missing color" so the swatch UI shows them as
//      out-of-stock instead of a fake hero.
//   5. Renames every product title's " — " separator to " in ", and swaps
//      the Clip-In Set prefix for the new premium name.
//
// Usage: node scripts/rename-and-restructure.js
// Safe to re-run — every step checks current state first.

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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "public" },
  auth: { persistSession: false },
});

const CATEGORY_RENAMES = {
  "tape-ins": "Ultra Tape Extensions",
  "clip-ins": "Premium Express Clip Ins",
  "hair-growth": "Hair Growth Products",
};

const TEXTURE_SLUGS = [
  "straight",
  "natural-wave",
  "water-wave",
  "loose-deep-curl",
  "deep-wave",
  "body-wave",
  "kinky-curl",
];

const PRODUCTS_TO_DELETE = ["clip-in-set-dark-brown", "body-wave-bundle-blonde"];

async function getCategoryId(slug) {
  const { data, error } = await supabase.from("categories").select("id").eq("slug", slug).single();
  if (error || !data) throw new Error(`Category '${slug}' not found: ${error?.message}`);
  return data.id;
}

async function renameCategories() {
  for (const [slug, name] of Object.entries(CATEGORY_RENAMES)) {
    const { error } = await supabase.from("categories").update({ name }).eq("slug", slug);
    if (error) throw new Error(`Rename '${slug}' failed: ${error.message}`);
    console.log(`✅  '${slug}' → "${name}"`);
  }
}

async function ensureBundlesCategory() {
  const hairId = await getCategoryId("hair");
  const { data: existing } = await supabase.from("categories").select("id").eq("slug", "bundles").maybeSingle();
  if (existing) {
    console.log(`⏭  'bundles' category already exists (id ${existing.id})`);
    return existing.id;
  }
  const { data, error } = await supabase
    .from("categories")
    .insert({ slug: "bundles", name: "Bundles", parent_id: hairId })
    .select("id")
    .single();
  if (error) throw new Error(`Insert 'bundles' failed: ${error.message}`);
  console.log(`✅  Created 'bundles' category (id ${data.id})`);
  return data.id;
}

async function reparentTextures(bundlesId) {
  const { error } = await supabase.from("categories").update({ parent_id: bundlesId }).in("slug", TEXTURE_SLUGS);
  if (error) throw new Error(`Reparent textures failed: ${error.message}`);
  console.log(`✅  Reparented ${TEXTURE_SLUGS.length} texture categories under 'bundles'`);
}

async function dualTagBundleProducts(bundlesId) {
  const { data: textureCats, error: catErr } = await supabase.from("categories").select("id").in("slug", TEXTURE_SLUGS);
  if (catErr) throw new Error(`Load texture category ids failed: ${catErr.message}`);
  const textureIds = textureCats.map((c) => c.id);

  const { data: links, error: linkErr } = await supabase
    .from("product_categories")
    .select("product_id")
    .in("category_id", textureIds);
  if (linkErr) throw new Error(`Load texture-tagged products failed: ${linkErr.message}`);
  const productIds = [...new Set(links.map((l) => l.product_id))];

  const { data: alreadyTagged, error: existErr } = await supabase
    .from("product_categories")
    .select("product_id")
    .eq("category_id", bundlesId)
    .in("product_id", productIds);
  if (existErr) throw new Error(`Load existing bundles tags failed: ${existErr.message}`);
  const alreadyTaggedIds = new Set(alreadyTagged.map((r) => r.product_id));

  const toInsert = productIds
    .filter((id) => !alreadyTaggedIds.has(id))
    .map((product_id) => ({ product_id, category_id: bundlesId }));

  if (toInsert.length === 0) {
    console.log("⏭  All bundle products already dual-tagged");
    return;
  }
  const { error: insertErr } = await supabase.from("product_categories").insert(toInsert);
  if (insertErr) throw new Error(`Dual-tag insert failed: ${insertErr.message}`);
  console.log(`✅  Dual-tagged ${toInsert.length} product(s) with 'bundles'`);
}

async function deleteFallbackHeroProducts() {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .in("slug", PRODUCTS_TO_DELETE)
    .select("slug");
  if (error) throw new Error(`Delete fallback-hero products failed: ${error.message}`);
  if (data.length === 0) {
    console.log("⏭  No fallback-hero products left to delete");
  } else {
    console.log(`✅  Deleted: ${data.map((p) => p.slug).join(", ")}`);
  }
}

async function renameProductTitles() {
  const { data: products, error } = await supabase.from("products").select("id, name");
  if (error) throw new Error(`Load products failed: ${error.message}`);

  let updated = 0;
  for (const p of products) {
    const newName = p.name.replace(/^Clip-In Set/, "Premium Express Clip Ins").replace(/ — /g, " in ");
    if (newName === p.name) continue;
    const { error: updateErr } = await supabase.from("products").update({ name: newName }).eq("id", p.id);
    if (updateErr) throw new Error(`Rename product ${p.id} failed: ${updateErr.message}`);
    updated++;
  }
  console.log(`✅  Renamed ${updated} product title(s)`);
}

async function main() {
  console.log("── Category renames ──");
  await renameCategories();

  console.log("── Bundles umbrella category ──");
  const bundlesId = await ensureBundlesCategory();
  await reparentTextures(bundlesId);
  await dualTagBundleProducts(bundlesId);

  console.log("── Hero-hierarchy correction ──");
  await deleteFallbackHeroProducts();

  console.log("── Product title renames ──");
  await renameProductTitles();

  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
