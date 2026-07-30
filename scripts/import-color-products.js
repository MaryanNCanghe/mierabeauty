// Generic, reusable color-product importer — one product per color, each
// with a full ordered gallery: hero (model photo) → bundle photo(s) → shared
// hair-length chart (last). Replaces the single-purpose
// import-straight-hair.js so future categories don't need a new script.
//
// Usage:
//   node scripts/import-color-products.js <manifest.json>
//
// Manifest shape (see scripts/deep-wave-manifest.json / clip-ins-manifest.json):
//   {
//     "categorySlug": "deep-wave",       // must already exist in `categories`
//     "nameTemplate": "Deep Wave Bundle",
//     "slugPrefix": "deep-wave-bundle",
//     "storagePrefix": "deep-wave",
//     "colors": [
//       { "colorName": "Natural Black", "heroImage": "<path>", "bundleImages": ["<path>", ...], "priceCents": null },
//       ...
//     ]
//   }
//
// All local paths are relative to the repo root (or absolute). Safe to
// re-run: existing product slugs are skipped.

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

// Shared across every category — same chart image, uploaded once (idempotent).
const LENGTH_CHART_LOCAL_PATH = path.join(
  ROOT,
  "public/miera-deep-wave-organized/hair-length-chart-add-all-product-v2 copy.png"
);
const LENGTH_CHART_STORAGE_PATH = "shared/hair-length-chart.png";

// Same length ladder used for the Straight Bundle products.
const LENGTH_VARIANTS = [
  { size: "14", price_cents: 12300 },
  { size: "18", price_cents: 14500 },
  { size: "22", price_cents: 17100 },
];
const DEFAULT_PRICE_CENTS = 14500;
const DEFAULT_STOCK = 10;

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveLocal(p) {
  return path.isAbsolute(p) ? p : path.join(ROOT, p);
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

async function uploadFile(storagePath, localPath) {
  const resolved = resolveLocal(localPath);
  const fileBuffer = fs.readFileSync(resolved);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: contentTypeFor(resolved),
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${resolved}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function getCategoryId(slug) {
  const { data, error } = await supabase.from("categories").select("id").eq("slug", slug).single();
  if (error || !data) throw new Error(`Category '${slug}' not found: ${error?.message}`);
  return data.id;
}

// If the target category's parent is the "bundles" umbrella, every product
// gets dual-tagged with bundles too — gives the homepage tile a real
// fallback image and keeps top-level "Hair" filtering complete.
async function getBundlesIdIfParent(categoryId) {
  const { data, error } = await supabase
    .from("categories")
    .select("parent_id, categories:parent_id(slug)")
    .eq("id", categoryId)
    .single();
  if (error || !data) return null;
  const parentSlug = data.categories?.slug;
  if (parentSlug !== "bundles") return null;
  return data.parent_id;
}

async function ensureLengthChartUrl() {
  return uploadFile(LENGTH_CHART_STORAGE_PATH, LENGTH_CHART_LOCAL_PATH);
}

async function importColorProduct(cfg, entry, categoryId, bundlesId, colorGroupId, chartUrl) {
  const { colorName, heroImage, bundleImages, priceCents } = entry;
  const colorSlug = slugify(colorName);
  const productSlug = `${cfg.slugPrefix}-${colorSlug}`;

  const { data: existing } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle();
  if (existing) {
    console.log(`⏭  Skipping ${productSlug} — already exists (id ${existing.id})`);
    return;
  }

  if (!heroImage || !bundleImages || bundleImages.length === 0) {
    console.warn(`⚠️  Missing hero/bundle images for ${colorName}, skipping`);
    return;
  }

  console.log(`⬆️  Uploading ${1 + bundleImages.length} photo(s) for ${colorName}...`);

  const heroUrl = await uploadFile(
    `${cfg.storagePrefix}/${colorSlug}/hero${path.extname(heroImage) || ".jpg"}`,
    heroImage
  );
  const bundleUrls = [];
  for (let i = 0; i < bundleImages.length; i++) {
    const ext = path.extname(bundleImages[i]) || ".jpg";
    bundleUrls.push(
      await uploadFile(`${cfg.storagePrefix}/${colorSlug}/bundle-${String(i + 1).padStart(2, "0")}${ext}`, bundleImages[i])
    );
  }

  // Bundle/product shots lead (this is what shows in listing thumbnails —
  // a hair store should look like a hair store, not a modeling catalogue),
  // then the demo-girl hero photo, chart last.
  const orderedImages = [...bundleUrls, heroUrl, chartUrl];

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      slug: productSlug,
      name: `${cfg.nameTemplate} in ${colorName}`,
      description: `${cfg.nameTemplate} in ${colorName}, crafted from real, ethically-sourced human hair with a naturally glossy finish.`,
      price_cents: priceCents ?? DEFAULT_PRICE_CENTS,
      main_image_url: bundleUrls[0],
      is_active: true,
      color_group_id: colorGroupId,
      color_name: colorName,
      texture: cfg.textureSlug,
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

  // Includes the hero at sort_order 0 — [slug]/page.tsx renders the gallery
  // from product_images alone whenever any rows exist, so the hero must be
  // one of them, not just main_image_url.
  const imageRows = orderedImages.map((url, i) => ({
    product_id: product.id,
    url,
    alt: `${colorName} ${cfg.nameTemplate}`,
    sort_order: i,
  }));
  const { error: imagesError } = await supabase.from("product_images").insert(imageRows);
  if (imagesError) throw new Error(`Insert product_images failed for ${productSlug}: ${imagesError.message}`);

  const categoryRows = [{ product_id: product.id, category_id: categoryId }];
  if (bundlesId) categoryRows.push({ product_id: product.id, category_id: bundlesId });
  const { error: categoryError } = await supabase.from("product_categories").insert(categoryRows);
  if (categoryError) throw new Error(`Insert product_categories failed for ${productSlug}: ${categoryError.message}`);

  console.log(`✅  Created ${productSlug} (id ${product.id}) — ${orderedImages.length} images${bundlesId ? " — dual-tagged with bundles" : ""}`);
}

async function main() {
  const manifestArg = process.argv[2];
  if (!manifestArg) {
    console.error("Usage: node scripts/import-color-products.js <manifest.json>");
    process.exit(1);
  }
  const manifestPath = resolveLocal(manifestArg);
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const { categorySlug, nameTemplate, slugPrefix, storagePrefix, colors } = manifest;
  // texture defaults to the category itself (true for all 7 texture
  // categories); manifests for non-texture categories (Clip-Ins, Tape-Ins,
  // etc.) must set this explicitly since their hair texture isn't implied
  // by their category slug.
  const textureSlug = manifest.textureSlug ?? categorySlug;

  console.log(`── Importing '${categorySlug}' from ${path.basename(manifestPath)} ──`);
  const categoryId = await getCategoryId(categorySlug);
  const bundlesId = await getBundlesIdIfParent(categoryId);
  const chartUrl = await ensureLengthChartUrl();

  // One shared id groups every color in this manifest as siblings of the
  // same style, so the storefront can switch between them via swatches.
  const colorGroupId = crypto.randomUUID();

  for (const entry of colors) {
    await importColorProduct(
      { nameTemplate, slugPrefix, storagePrefix, textureSlug },
      entry,
      categoryId,
      bundlesId,
      colorGroupId,
      chartUrl
    );
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
