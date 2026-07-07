
// src/components/CategoryList.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import MobileScrollHintRight from "./MobileScrollHintRight";

const CategoryList = async () => {
  const supabase = supabaseServer();
  const { data: cats, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load categories: ${error.message}`);

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
              href={`/list?cat=${item.slug}`}
              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 xl:w-1/6 snap-start"
              key={item.id}
            >
              <div className="relative bg-slate-100 w-full h-[750px] sm:h-[900px] md:h-[500px] lg:h-[500px]">
                <img src="/placeholder.png" alt="" />
              </div>
              <h1 className="mt-8 z-label-1 tracking-wide border border-black px-4 py-2 inline-block">
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
