// One-off: for every live color-grouped product (Bundles + Clip-Ins),
// reorders its gallery from [demo-girl, bundle…, chart] to
// [bundle…, demo-girl, chart] and updates main_image_url to the new first
// (bundle) image — so listing thumbnails show product photography instead
// of a model photo. Nothing is deleted; the demo-girl photo just moves to
// second-to-last instead of leading.
//
// Usage: node scripts/reorder-galleries-bundle-first.js
// Safe to re-run — if a product's gallery already starts with a bundle
// photo (i.e. was imported after the import-color-products.js fix), it's
// left untouched.

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

async function reorderProduct(product) {
  const { data: images, error: imgErr } = await supabase
    .from("product_images")
    .select("id, url, alt, sort_order")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });
  if (imgErr) throw new Error(`Load images failed for product ${product.id}: ${imgErr.message}`);

  if (!images || images.length < 3) {
    console.log(`⏭  Product ${product.id} (${product.slug}): fewer than 3 images, skipping`);
    return;
  }

  const [heroImg, ...rest] = images;
  const chartImg = rest[rest.length - 1];
  const bundleImgs = rest.slice(0, -1);

  // Heuristic: the chart is always the shared image at the very end
  // (uploaded to shared/hair-length-chart.png); the current first image is
  // the demo-girl hero. If bundleImgs is empty, there's nothing to promote.
  if (bundleImgs.length === 0) {
    console.log(`⏭  Product ${product.id} (${product.slug}): no bundle photos to promote, skipping`);
    return;
  }

  // Already in the new order? (first image isn't the hero any more because
  // this product was imported after the import-color-products.js fix)
  const looksAlreadyFixed = heroImg.url.includes("/hero.") === false;
  if (looksAlreadyFixed) {
    console.log(`⏭  Product ${product.id} (${product.slug}): already bundle-first, skipping`);
    return;
  }

  const newOrder = [...bundleImgs, heroImg, chartImg];

  for (let i = 0; i < newOrder.length; i++) {
    if (newOrder[i].sort_order === i) continue;
    const { error } = await supabase.from("product_images").update({ sort_order: i }).eq("id", newOrder[i].id);
    if (error) throw new Error(`Update sort_order failed for image ${newOrder[i].id}: ${error.message}`);
  }

  const { error: prodErr } = await supabase
    .from("products")
    .update({ main_image_url: newOrder[0].url })
    .eq("id", product.id);
  if (prodErr) throw new Error(`Update main_image_url failed for product ${product.id}: ${prodErr.message}`);

  console.log(`✅  Product ${product.id} (${product.slug}): reordered, main_image_url -> bundle photo`);
}

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug")
    .not("color_group_id", "is", null)
    .order("id", { ascending: true });
  if (error) throw new Error(`Load products failed: ${error.message}`);

  console.log(`Found ${products.length} color-grouped products.`);
  for (const product of products) {
    await reorderProduct(product);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
