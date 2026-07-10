
// src/components/CategoryList.tsx
import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import MobileScrollHintRight from "./MobileScrollHintRight";

// Friendlier storefront labels for the Hair subcategories.
// Anything not listed here just falls back to its DB name.
const DISPLAY_NAME: Record<string, string> = {
  "virgin-human-hair": "100% Virgin",
  "lace-front-wigs": "Front Lace",
  "bundles-weaves": "Bundles",
  "clip-ins": "Clip-Ins",
};

// Subcategories hidden from the homepage catalogue only — they still
// exist as filter options on the Shop page.
const HIDDEN_ON_HOME = new Set(["closures-frontals", "hair-growth", "full-lace-wigs"]);

// Preferred display order; unlisted slugs are appended afterwards.
const ORDER = [
  "virgin-human-hair",
  "lace-front-wigs",
  "bundles-weaves",
  "clip-ins",
  "ponytails",
];

const CategoryList = async () => {
  const supabase = supabaseServer();
  const { data: allCats, error } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id, image_url")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  const hair = (allCats ?? []).find((c) => c.slug === "hair" && !c.parent_id);
  const subCats = (allCats ?? []).filter(
    (c) => c.parent_id === hair?.id && !HIDDEN_ON_HOME.has(c.slug)
  );

  // Fallback to a representative product image for subcategories
  // that don't have their own image_url set yet.
  const missingImageIds = subCats.filter((c) => !c.image_url).map((c) => c.id);
  const fallbackImages: Record<number, string> = {};
  if (missingImageIds.length) {
    const { data: pc } = await supabase
      .from("product_categories")
      .select("category_id, products(main_image_url)")
      .in("category_id", missingImageIds);

    for (const row of pc ?? []) {
      const img = (row as any).products?.main_image_url;
      if (img && !fallbackImages[row.category_id]) {
        fallbackImages[row.category_id] = img;
      }
    }
  }

  const cats = subCats
    .map((c) => ({
      ...c,
      displayName: DISPLAY_NAME[c.slug] ?? c.name,
      displayImage: c.image_url ?? fallbackImages[c.id] ?? null,
    }))
    .sort((a, b) => {
      const ai = ORDER.indexOf(a.slug);
      const bi = ORDER.indexOf(b.slug);
      if (ai === -1 && bi === -1) return a.slug.localeCompare(b.slug);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  if (!cats?.length) return null;

  return (
    <div className="relative px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-36">
      {/* Scroller principal (mobile com snap) */}
      <div
        id="cat-scroller"
        className="overflow-x-scroll scrollbar-hide scroll-smooth snap-x snap-mandatory"
      >
        <div className="flex gap-4 md:gap-8">
          {(cats ?? []).map((item) => (
            <Link
              href={`/shop?cat=${item.slug}`}
              className="flex-shrink-0 w-1/2 sm:w-1/3 lg:w-1/4 snap-start"
              key={item.id}
            >
              <div className="relative bg-[var(--m-blush)] w-full h-56 sm:h-64 md:h-72 overflow-hidden rounded-lg">
                {item.displayImage && (
                  <Image
                    src={item.displayImage}
                    alt={item.displayName ?? ""}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                )}
              </div>
              <h1 className="mt-4 z-label-1 tracking-wide border-b border-[var(--m-black)] pb-2 block w-full">
                {item.displayName}
              </h1>
            </Link>
          ))}
        </div>
      </div>

      {/* Indicador/Seta só no mobile */}
      <MobileScrollHintRight targetId="cat-scroller" />
    </div>
  );
};

export default CategoryList;
