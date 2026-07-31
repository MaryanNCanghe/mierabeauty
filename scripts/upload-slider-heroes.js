// One-off: uploads the 3 chosen homepage-slider hero photos from
// public/organized-hair-images-extra-girl-for-heros/ to Supabase Storage
// and prints their public URLs (that folder is gitignored / not deployed,
// so the Slider component must reference Storage URLs, not local paths).
//
// Usage: node scripts/upload-slider-heroes.js

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

const SLIDER_FILES = [
  "chestnut-brown-natural-wave.png",
  "golden-blonde-natural-wave.png",
  "natural-black-kinky-curly-ponytail.png",
];

async function uploadFile(filename) {
  const localPath = path.join(SRC_DIR, filename);
  const storagePath = `decorative/${filename}`;
  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`${filename} -> ${data.publicUrl}`);
  return data.publicUrl;
}

async function main() {
  for (const filename of SLIDER_FILES) {
    await uploadFile(filename);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
