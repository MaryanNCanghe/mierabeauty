// One-off import, two phases:
//
//   Phase 1 — category migration: creates the 7 new texture categories
//   (straight, natural-wave, water-wave, loose-deep-curl, deep-wave,
//   body-wave, kinky-curl) under Hair, recategorizes the 4 existing products
//   that were under the legacy "Bundles & Weaves" / "Virgin Human Hair"
//   categories onto their matching texture category, then removes those two
//   legacy categories.
//
//   Phase 2 — imports one product per color for "Straight", uploading photos
//   to Supabase Storage and linking every color into a shared
//   `color_group_id` (+ per-product `color_name`) so the storefront's
//   color-swatch switcher can navigate between them.
//
// Usage:
//   node scripts/import-straight-hair.js
//
// Phase 2 reads its input from scripts/straight-hair-manifest.json — see
// scripts/straight-hair-manifest.example.json for the shape. Fill in the real
// manifest (color name -> local image path(s)) once the photo folder is available,
// then run this script once. It's safe to re-run: existing categories/slugs are skipped.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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

const BUCKET = "product-images";

// ── Phase 1 config: category migration ──────────────────────────────
const NEW_TEXTURE_CATEGORIES = [
  { slug: "straight", name: "Straight" },
  { slug: "natural-wave", name: "Natural Wave" },
  { slug: "water-wave", name: "Water Wave" },
  { slug: "loose-deep-curl", name: "Loose Deep Curl" },
  { slug: "deep-wave", name: "Deep Wave" },
  { slug: "body-wave", name: "Body Wave" },
  { slug: "kinky-curl", name: "Kinky Curl" },
];

// Existing products currently under the legacy "Bundles & Weaves" /
// "Virgin Human Hair" categories, keyed by product id, mapped to their
// matching new texture category slug.
const LEGACY_PRODUCT_RECATEGORIZATION = {
  5: "body-wave", // Virgin Bundle Trio — Body Wave
  6: "straight", // Silk Bundle Set — Straight
  8: "deep-wave", // Virgin Hair Bundle — Deep Wave
  9: "kinky-curl", // Virgin Hair Bundle — Kinky Curly
};
const LEGACY_CATEGORY_SLUGS = ["bundles-weaves", "virgin-human-hair"];

// Same length ladder/prices as the existing `silk-bundle-set-straight` product.
const LENGTH_VARIANTS = [
  { size: "14", price_cents: 12300 },
  { size: "18", price_cents: 14500 },
  { size: "22", price_cents: 17100 },
];
const DEFAULT_PRICE_CENTS = 14500; // matches the 18" / mid-tier price
const DEFAULT_STOCK = 10;

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    }[ext] || "application/octet-stream"
  );
}

async function uploadImage(colorSlug, localPath, index) {
  const ext = path.extname(localPath) || ".jpg";
  const storagePath = `straight-hair/${colorSlug}/${String(index + 1).padStart(2, "0")}${ext}`;
  const fileBuffer = fs.readFileSync(localPath);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: contentTypeFor(localPath),
      upsert: true,
    });
  if (uploadError) throw new Error(`Upload failed for ${localPath}: ${uploadError.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function getCategoryId(slug) {
  const { data, error } = await supabase.from("categories").select("id").eq("slug", slug).single();
  if (error || !data) throw new Error(`Category '${slug}' not found: ${error?.message}`);
  return data.id;
}

// Phase 1: creates the 7 texture categories, recategorizes the legacy
// bundle/virgin-hair products onto them, then retires the legacy categories.
// Returns the new "straight" category id for Phase 2 to use.
async function migrateCategories() {
  const hairId = await getCategoryId("hair");

  const categoryIdBySlug = {};
  for (const cat of NEW_TEXTURE_CATEGORIES) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", cat.slug)
      .maybeSingle();

    if (existing) {
      categoryIdBySlug[cat.slug] = existing.id;
      console.log(`⏭  Category '${cat.slug}' already exists (id ${existing.id})`);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("categories")
      .insert({ slug: cat.slug, name: cat.name, parent_id: hairId })
      .select("id")
      .single();
    if (error) throw new Error(`Insert category '${cat.slug}' failed: ${error.message}`);
    categoryIdBySlug[cat.slug] = inserted.id;
    console.log(`✅  Created category '${cat.slug}' (id ${inserted.id})`);
  }

  for (const [productIdStr, targetSlug] of Object.entries(LEGACY_PRODUCT_RECATEGORIZATION)) {
    const productId = Number(productIdStr);
    const targetCategoryId = categoryIdBySlug[targetSlug];

    const { error: deleteError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId);
    if (deleteError) throw new Error(`Failed clearing categories for product ${productId}: ${deleteError.message}`);

    const { error: insertError } = await supabase
      .from("product_categories")
      .insert({ product_id: productId, category_id: targetCategoryId });
    if (insertError) throw new Error(`Failed relinking product ${productId} to '${targetSlug}': ${insertError.message}`);

    console.log(`✅  Recategorized product ${productId} → '${targetSlug}'`);
  }

  const { error: deleteCatError } = await supabase.from("categories").delete().in("slug", LEGACY_CATEGORY_SLUGS);
  if (deleteCatError) throw new Error(`Failed deleting legacy categories: ${deleteCatError.message}`);
  console.log(`✅  Removed legacy categories: ${LEGACY_CATEGORY_SLUGS.join(", ")}`);

  return categoryIdBySlug["straight"];
}

async function importColor(entry, categoryId, colorGroupId) {
  const { colorName, images, priceCents } = entry;
  const colorSlug = slugify(colorName);
  const productSlug = `straight-bundle-${colorSlug}`;

  const { data: existing } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle();
  if (existing) {
    console.log(`⏭  Skipping ${productSlug} — already exists (id ${existing.id})`);
    return;
  }

  if (!images || images.length === 0) {
    console.warn(`⚠️  No images for ${colorName}, skipping`);
    return;
  }

  console.log(`⬆️  Uploading ${images.length} photo(s) for ${colorName}...`);
  const publicUrls = [];
  for (let i = 0; i < images.length; i++) {
    publicUrls.push(await uploadImage(colorSlug, images[i], i));
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      slug: productSlug,
      name: `Straight Bundle — ${colorName}`,
      description: `Bone-straight virgin bundles in ${colorName}, with a naturally glossy finish. Blends effortlessly with your leave-out for a seamless install.`,
      price_cents: priceCents ?? DEFAULT_PRICE_CENTS,
      main_image_url: publicUrls[0],
      is_active: true,
      color_group_id: colorGroupId,
      color_name: colorName,
    })
    .select("id")
    .single();
  if (productError) throw new Error(`Insert product failed for ${productSlug}: ${productError.message}`);

  const variantRows = LENGTH_VARIANTS.map((v) => ({
    product_id: product.id,
    color: null,
    size: v.size,
    price_cents: v.price_cents,
    stock: DEFAULT_STOCK,
  }));
  const { error: variantError } = await supabase.from("product_variants").insert(variantRows);
  if (variantError) throw new Error(`Insert variants failed for ${productSlug}: ${variantError.message}`);

  if (publicUrls.length > 1) {
    const imageRows = publicUrls.slice(1).map((url, i) => ({
      product_id: product.id,
      url,
      alt: `${colorName} straight bundle`,
      sort_order: i + 1,
    }));
    const { error: imagesError } = await supabase.from("product_images").insert(imageRows);
    if (imagesError) throw new Error(`Insert product_images failed for ${productSlug}: ${imagesError.message}`);
  }

  const { error: categoryError } = await supabase
    .from("product_categories")
    .insert({ product_id: product.id, category_id: categoryId });
  if (categoryError) throw new Error(`Insert product_categories failed for ${productSlug}: ${categoryError.message}`);

  console.log(`✅  Created ${productSlug} (id ${product.id})`);
}

async function main() {
  console.log("── Phase 1: category migration ──");
  const straightCategoryId = await migrateCategories();

  console.log("── Phase 2: import Straight Bundle color products ──");
  const manifestPath = path.join(ROOT, "scripts", "straight-hair-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(
      `No manifest found at ${manifestPath}.\n` +
        `Copy scripts/straight-hair-manifest.example.json to scripts/straight-hair-manifest.json ` +
        `and fill in the real color -> image path mapping first.`
    );
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // One shared id groups every color in this manifest as siblings of the
  // same style, so the storefront can switch between them via swatches.
  const colorGroupId = crypto.randomUUID();

  for (const entry of manifest) {
    await importColor(entry, straightCategoryId, colorGroupId);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
