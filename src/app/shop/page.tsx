import { Suspense } from "react";
import ShopLayout from "@/components/ShopLayout";
import ProductListSupabase from "@/components/ProductList";
import Skeleton from "@/components/Skeleton";
import { supabaseServer } from "@/lib/supabase/server";

const ListPage = async ({ searchParams }: { searchParams?: any }) => {
  const supabase = supabaseServer();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 bg-[var(--m-white)]">
      <ShopLayout categories={categories ?? []}>
        <Suspense fallback={<Skeleton />}>
          <ProductListSupabase searchParams={searchParams} showPagination />
        </Suspense>
      </ShopLayout>
    </div>
  );
};

export default ListPage;
