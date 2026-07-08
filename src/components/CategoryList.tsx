
// src/components/CategoryList.tsx
import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import MobileScrollHintRight from "./MobileScrollHintRight";
import { topLevelCategories } from "@/lib/categories";

const CategoryList = async () => {
  const supabase = supabaseServer();
  const { data: allCats, error } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id, image_url")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  const cats = topLevelCategories(allCats ?? []);

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
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.name ?? ""}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                )}
              </div>
              <h1 className="mt-4 z-label-1 tracking-wide border-b border-[var(--m-black)] pb-2 block w-full">
                {item.name}
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
