// src/components/ShopByColor.tsx
import { supabaseServer } from "@/lib/supabase/server";
import ShopByColorPicker from "./ShopByColorPicker";
import type { ProductCardData } from "./ProductCard";

function resolveUrl(url?: string | null): string {
  if (!url) return "/product.png";
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${url.replace(/^\/+/, "")}`;
}

export default async function ShopByColor() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, price_cents, main_image_url, color_name")
    .not("color_name", "is", null);

  if (error) throw new Error(`Failed to load color-matched products: ${error.message}`);
  if (!data?.length) return null;

  const products: (ProductCardData & { color_name: string })[] = data.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price_cents: p.price_cents,
    images: [resolveUrl(p.main_image_url)],
    color_name: p.color_name as string,
  }));

  return <ShopByColorPicker products={products} />;
}
