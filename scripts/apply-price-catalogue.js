// Seeds price_catalogue (factory cost / retail, USD cents) from the source
// price sheet, then regenerates product_variants for every live product in
// a texture-bundle category or "clip-ins" to match real per-length,
// per-texture retail pricing (converted to EUR cents for storage, matching
// every other price in this DB).
//
// Edit CATALOGUE_ROWS below and re-run any time prices change — both
// phases are idempotent (catalogue rows upsert by product_type/length_in/
// texture; variants are fully replaced per product, not appended).
//
// Usage: node scripts/apply-price-catalogue.js
//
// Requires the price_catalogue table to already exist — run the
// `create table price_catalogue` block from supabase-schema.sql once in
// the Supabase SQL Editor first (DDL can't go through the service-role
// REST client used here).

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

// Matches src/lib/countryCurrency.ts EUR_EXCHANGE_RATE.usd — keep in sync.
const USD_TO_EUR_RATE = 1.09;
function usdCentsToEurCents(usdCents) {
  return Math.round(usdCents / USD_TO_EUR_RATE);
}

// ── Source price sheet (USD cents) ───────────────────────────────────
// dollars -> cents: multiply by 100, round to nearest cent.
const CATALOGUE_ROWS = [
  // Bundle (100g) — every 2" from 10" to 30", Straight vs Wave/Curly
  { product_type: "bundle", length_in: 10, texture: "straight", factory: 2765, retail: 4800, status: "✅ Apohair+AZ avg" },
  { product_type: "bundle", length_in: 10, texture: "wave_curly", factory: 3365, retail: 5900, status: "🔶 est." },
  { product_type: "bundle", length_in: 12, texture: "straight", factory: 3195, retail: 5600, status: "✅" },
  { product_type: "bundle", length_in: 12, texture: "wave_curly", factory: 3795, retail: 6600, status: "🔶" },
  { product_type: "bundle", length_in: 14, texture: "straight", factory: 3530, retail: 6200, status: "✅" },
  { product_type: "bundle", length_in: 14, texture: "wave_curly", factory: 4130, retail: 7200, status: "🔶" },
  { product_type: "bundle", length_in: 16, texture: "straight", factory: 4353, retail: 7600, status: "✅ 3-vendor avg" },
  { product_type: "bundle", length_in: 16, texture: "wave_curly", factory: 4953, retail: 8700, status: "🔶" },
  { product_type: "bundle", length_in: 18, texture: "straight", factory: 4923, retail: 8600, status: "✅" },
  { product_type: "bundle", length_in: 18, texture: "wave_curly", factory: 5523, retail: 9700, status: "🔶" },
  { product_type: "bundle", length_in: 20, texture: "straight", factory: 6233, retail: 10900, status: "✅" },
  { product_type: "bundle", length_in: 20, texture: "wave_curly", factory: 6833, retail: 12000, status: "🔶" },
  { product_type: "bundle", length_in: 22, texture: "straight", factory: 7027, retail: 12300, status: "✅" },
  { product_type: "bundle", length_in: 22, texture: "wave_curly", factory: 7627, retail: 13300, status: "🔶" },
  { product_type: "bundle", length_in: 24, texture: "straight", factory: 7970, retail: 13900, status: "✅" },
  { product_type: "bundle", length_in: 24, texture: "wave_curly", factory: 8570, retail: 15000, status: "🔶" },
  { product_type: "bundle", length_in: 26, texture: "straight", factory: 8727, retail: 15300, status: "✅" },
  { product_type: "bundle", length_in: 26, texture: "wave_curly", factory: 9327, retail: 16300, status: "🔶" },
  { product_type: "bundle", length_in: 28, texture: "straight", factory: 9177, retail: 16100, status: "✅" },
  { product_type: "bundle", length_in: 28, texture: "wave_curly", factory: 9777, retail: 17100, status: "🔶" },
  { product_type: "bundle", length_in: 30, texture: "straight", factory: 10020, retail: 17500, status: "✅" },
  { product_type: "bundle", length_in: 30, texture: "wave_curly", factory: 10620, retail: 18600, status: "🔶" },

  // Lace Front Wig 13x4 — Natural/Straight only
  { product_type: "lace_front_wig_13x4", length_in: 10, texture: "straight", factory: 9000, retail: 15800, status: "✅ Apohair" },
  { product_type: "lace_front_wig_13x4", length_in: 12, texture: "straight", factory: 10200, retail: 17900, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 14, texture: "straight", factory: 10900, retail: 19100, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 16, texture: "straight", factory: 12000, retail: 21000, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 18, texture: "straight", factory: 14500, retail: 25400, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 20, texture: "straight", factory: 16300, retail: 28500, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 22, texture: "straight", factory: 20000, retail: 35000, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 24, texture: "straight", factory: 25900, retail: 45300, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 26, texture: "straight", factory: 32000, retail: 56000, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 28, texture: "straight", factory: 38000, retail: 66500, status: "✅" },
  { product_type: "lace_front_wig_13x4", length_in: 30, texture: "straight", factory: 43400, retail: 76000, status: "✅" },

  // No-length / "starting at" / range-only rows
  { product_type: "closure_5x5", length_in: null, texture: null, factory: 7000, factory_high: null, retail: 12300, retail_high: null, status: '✅ "starting at" only' },
  { product_type: "frontal_13x4", length_in: null, texture: null, factory: 7400, factory_high: null, retail: 13000, retail_high: null, status: '✅ "starting at" only' },
  { product_type: "frontal_13x6", length_in: null, texture: null, factory: 9000, factory_high: 30900, retail: 15800, retail_high: 54100, status: "✅ range only" },
  { product_type: "full_lace_wig", length_in: null, texture: null, factory: 11800, factory_high: 33500, retail: 20700, retail_high: 58600, status: "✅ range only" },
  { product_type: "u_v_part_wig", length_in: null, texture: null, factory: 7500, factory_high: 22800, retail: 13100, retail_high: 39900, status: "✅ range only" },

  // Clip-In Set (~120g) — rough estimates, Straight only
  { product_type: "clip_in_set", length_in: 16, texture: "straight", factory: 7000, retail: 12300, status: "🔶 rough est." },
  { product_type: "clip_in_set", length_in: 20, texture: "straight", factory: 9600, retail: 16800, status: "🔶 rough est." },
  { product_type: "clip_in_set", length_in: 24, texture: "straight", factory: 12000, retail: 21000, status: "🔶 rough est." },

  // Ponytail — no vendor price yet
  { product_type: "ponytail", length_in: null, texture: null, factory: null, factory_high: null, retail: null, retail_high: null, status: "❌ no vendor price yet" },
];

// Texture-category slugs -> catalogue texture bucket. Straight is its own
// bucket; every other bundle texture is priced as "wave_curly".
const TEXTURE_CATEGORY_TO_CATALOGUE_TEXTURE = {
  straight: "straight",
  "natural-wave": "wave_curly",
  "water-wave": "wave_curly",
  "loose-deep-curl": "wave_curly",
  "deep-wave": "wave_curly",
  "body-wave": "wave_curly",
  "kinky-curl": "wave_curly",
};

const BUNDLE_LENGTHS = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
const CLIP_IN_LENGTHS = [16, 20, 24];
const DEFAULT_STOCK = 10;

async function seedCatalogue() {
  const rows = CATALOGUE_ROWS.map((r) => ({
    product_type: r.product_type,
    length_in: r.length_in,
    texture: r.texture,
    factory_cost_low_usd_cents: r.factory ?? null,
    factory_cost_high_usd_cents: r.factory_high ?? r.factory ?? null,
    retail_low_usd_cents: r.retail ?? null,
    retail_high_usd_cents: r.retail_high ?? r.retail ?? null,
    status: r.status ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("price_catalogue")
    .upsert(rows, { onConflict: "product_type,length_in,texture" });
  if (error) throw new Error(`Seeding price_catalogue failed: ${error.message}`);
  console.log(`✅  Seeded/updated ${rows.length} price_catalogue rows`);
}

function catalogueLookup(productType, texture) {
  const map = {};
  for (const r of CATALOGUE_ROWS) {
    if (r.product_type !== productType) continue;
    if (r.texture !== texture) continue;
    map[r.length_in] = r.retail;
  }
  return map;
}

async function regenerateVariantsForProduct(productId, lengths, priceMapUsdCents) {
  const { error: delErr } = await supabase.from("product_variants").delete().eq("product_id", productId);
  if (delErr) throw new Error(`Delete variants failed for product ${productId}: ${delErr.message}`);

  const rows = lengths
    .filter((len) => priceMapUsdCents[len] != null)
    .map((len) => ({
      product_id: productId,
      color: null,
      size: String(len),
      price_cents: usdCentsToEurCents(priceMapUsdCents[len]),
      stock: DEFAULT_STOCK,
    }));

  if (rows.length === 0) return 0;
  const { error: insErr } = await supabase.from("product_variants").insert(rows);
  if (insErr) throw new Error(`Insert variants failed for product ${productId}: ${insErr.message}`);

  // products.price_cents drives the "From X" price shown on listing cards
  // (ProductCard/ProductList read the product row directly, not variants) —
  // keep it in sync with the cheapest real variant, or list pages go stale.
  const cheapest = Math.min(...rows.map((r) => r.price_cents));
  const { error: prodErr } = await supabase.from("products").update({ price_cents: cheapest }).eq("id", productId);
  if (prodErr) throw new Error(`Update products.price_cents failed for product ${productId}: ${prodErr.message}`);

  return rows.length;
}

async function applyBundlePricing() {
  const textureSlugs = Object.keys(TEXTURE_CATEGORY_TO_CATALOGUE_TEXTURE);
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug").in("slug", textureSlugs);
  if (catErr) throw new Error(`Load texture categories failed: ${catErr.message}`);

  for (const cat of cats) {
    const catalogueTexture = TEXTURE_CATEGORY_TO_CATALOGUE_TEXTURE[cat.slug];
    const priceMap = catalogueLookup("bundle", catalogueTexture);

    const { data: links, error: linkErr } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", cat.id);
    if (linkErr) throw new Error(`Load products for '${cat.slug}' failed: ${linkErr.message}`);

    for (const { product_id } of links) {
      const count = await regenerateVariantsForProduct(product_id, BUNDLE_LENGTHS, priceMap);
      console.log(`✅  [${cat.slug}] product ${product_id}: ${count} variants (${catalogueTexture})`);
    }
  }
}

async function applyClipInPricing() {
  const { data: cat, error: catErr } = await supabase.from("categories").select("id").eq("slug", "clip-ins").single();
  if (catErr || !cat) throw new Error(`'clip-ins' category not found: ${catErr?.message}`);

  const priceMap = catalogueLookup("clip_in_set", "straight");

  const { data: links, error: linkErr } = await supabase
    .from("product_categories")
    .select("product_id")
    .eq("category_id", cat.id);
  if (linkErr) throw new Error(`Load clip-in products failed: ${linkErr.message}`);

  for (const { product_id } of links) {
    const count = await regenerateVariantsForProduct(product_id, CLIP_IN_LENGTHS, priceMap);
    console.log(`✅  [clip-ins] product ${product_id}: ${count} variants`);
  }
}

async function main() {
  console.log("── Seeding price_catalogue ──");
  await seedCatalogue();

  console.log("── Applying bundle-texture pricing to live products ──");
  await applyBundlePricing();

  console.log("── Applying clip-in pricing to live products ──");
  await applyClipInPricing();

  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
