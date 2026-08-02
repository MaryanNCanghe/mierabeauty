// One-off: the user replaced the Straight bundle photos with a new style.
// The 7 Straight products already exist (from the original import), so a
// plain re-run of import-color-products.js would just skip them (existing
// slugs). This script instead replaces their product_images in place:
// uploads the new bundle photos + existing hero/chart, rebuilds the gallery
// as [bundle…, hero, chart], and updates main_image_url — everything else
// (variants, pricing, slug, category, color_group_id) is untouched.
//
// Usage: node scripts/update-straight-images.js

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

const BUCKET = "product-images";
const CHART_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/shared/hair-length-chart.png`;

const SRC_ROOT = path.join(ROOT, "public/straights-organized");
const EXTRA_GIRL_ROOT = path.join(ROOT, "public/organized-hair-images-extra-girl-for-heros");
const DEMO_ROOT = path.join(SRC_ROOT, "miera straigth girls demo.  copy");

const COLORS = [
  {
    productSlug: "straight-bundle-natural-black",
    colorSlug: "natural-black",
    hero: path.join(DEMO_ROOT, "natural-back1.png"),
    bundleDir: path.join(SRC_ROOT, "natural-black"),
  },
  {
    productSlug: "straight-bundle-dark-brown",
    colorSlug: "dark-brown",
    hero: path.join(EXTRA_GIRL_ROOT, "dark-brown-straight.png"),
    bundleDir: path.join(SRC_ROOT, "dark-brown"),
  },
  {
    productSlug: "straight-bundle-natural-brown",
    colorSlug: "natural-brown",
    hero: path.join(DEMO_ROOT, "natural-brown2.png"),
    bundleDir: path.join(SRC_ROOT, "natural-brown"),
  },
  {
    productSlug: "straight-bundle-caramel-brown",
    colorSlug: "caramel-brown",
    hero: path.join(DEMO_ROOT, "caramel-brown-hero.png"),
    bundleDir: path.join(SRC_ROOT, "caramel-brown"),
  },
  {
    productSlug: "straight-bundle-chestnut-brown",
    colorSlug: "chestnut-brown",
    hero: path.join(DEMO_ROOT, "chestnut-brown.png"),
    bundleDir: path.join(SRC_ROOT, "chestnut-brown"),
  },
  {
    productSlug: "straight-bundle-blonde",
    colorSlug: "blonde",
    hero: path.join(DEMO_ROOT, "golden-blonde.png"),
    bundleDir: path.join(SRC_ROOT, "golden-blonde"),
  },
  {
    productSlug: "straight-bundle-platinum-blonde",
    colorSlug: "platinum-blonde",
    hero: path.join(DEMO_ROOT, "Platinum blonde.png"),
    bundleDir: path.join(SRC_ROOT, "platinum-blonde"),
  },
];

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" }[ext] || "application/octet-stream";
}

async function uploadFile(storagePath, localPath) {
  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: contentTypeFor(localPath),
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${localPath}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function updateColor(entry) {
  const { data: product, error: prodErr } = await supabase
    .from("products")
    .select("id")
    .eq("slug", entry.productSlug)
    .single();
  if (prodErr || !product) throw new Error(`Product '${entry.productSlug}' not found: ${prodErr?.message}`);

  const bundleFiles = fs
    .readdirSync(entry.bundleDir)
    .filter((f) => !f.startsWith(".") && /\.(png|jpe?g|webp)$/i.test(f))
    .sort();

  console.log(`⬆️  Uploading ${bundleFiles.length} new bundle photo(s) + hero for ${entry.colorSlug}...`);

  const heroUrl = await uploadFile(`straight/${entry.colorSlug}/hero${path.extname(entry.hero)}`, entry.hero);
  const bundleUrls = [];
  for (let i = 0; i < bundleFiles.length; i++) {
    const localPath = path.join(entry.bundleDir, bundleFiles[i]);
    const ext = path.extname(bundleFiles[i]) || ".png";
    bundleUrls.push(await uploadFile(`straight/${entry.colorSlug}/bundle-${String(i + 1).padStart(2, "0")}${ext}`, localPath));
  }

  const orderedImages = [...bundleUrls, heroUrl, CHART_URL];

  const { error: delErr } = await supabase.from("product_images").delete().eq("product_id", product.id);
  if (delErr) throw new Error(`Delete images failed for ${entry.productSlug}: ${delErr.message}`);

  const imageRows = orderedImages.map((url, i) => ({
    product_id: product.id,
    url,
    alt: `${entry.colorSlug} Straight Bundle`,
    sort_order: i,
  }));
  const { error: insErr } = await supabase.from("product_images").insert(imageRows);
  if (insErr) throw new Error(`Insert images failed for ${entry.productSlug}: ${insErr.message}`);

  const { error: updErr } = await supabase.from("products").update({ main_image_url: bundleUrls[0] }).eq("id", product.id);
  if (updErr) throw new Error(`Update main_image_url failed for ${entry.productSlug}: ${updErr.message}`);

  console.log(`✅  ${entry.productSlug}: ${orderedImages.length} images (${bundleUrls.length} bundle + hero + chart)`);
}

async function main() {
  for (const entry of COLORS) {
    await updateColor(entry);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
