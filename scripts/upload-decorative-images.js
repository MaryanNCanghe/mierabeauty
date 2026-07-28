// One-off: uploads a handful of decorative "extra girl" hero photos to
// Supabase Storage (for homepage tiles, slider, about page) and sets
// categories.image_url for the ones used as category tile images. Prints
// every resulting public URL so they can be wired into the frontend by hand.
//
// Usage: node scripts/upload-decorative-images.js

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
const SRC_DIR = path.join(ROOT, "public/organized-hair-images-extra-girl-for-heros");

const FILES = {
  ponytailsTile: "natural-black-kinky-curly-ponytail.png",
  closuresFrontalsTile: "dark-brown-deep-wave.png",
  bundlesTile: "dark-brown-body-wave.png",
  slide2: "golden-blonde-natural-wave.png",
  slide3: "dark-brown-loose-deep-wave.png",
  aboutHero: "chestnut-brown-natural-wave.png",
};

async function uploadFile(key, filename) {
  const localPath = path.join(SRC_DIR, filename);
  const storagePath = `decorative/${filename}`;
  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`${key}: ${data.publicUrl}`);
  return data.publicUrl;
}

async function setCategoryImage(slug, url) {
  const { error } = await supabase.from("categories").update({ image_url: url }).eq("slug", slug);
  if (error) throw new Error(`Failed to set image_url for '${slug}': ${error.message}`);
  console.log(`✅  categories.${slug}.image_url set`);
}

async function main() {
  const urls = {};
  for (const [key, filename] of Object.entries(FILES)) {
    urls[key] = await uploadFile(key, filename);
  }

  await setCategoryImage("ponytails", urls.ponytailsTile);
  await setCategoryImage("closures-frontals", urls.closuresFrontalsTile);
  await setCategoryImage("bundles", urls.bundlesTile);

  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
