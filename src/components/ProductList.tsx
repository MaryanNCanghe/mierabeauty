// src/components/ProductList.tsx
import { supabaseServer } from '@/lib/supabase/server';
import Pagination from './Pagination';
import ProductCard, { type ProductCardData } from './ProductCard';

const PRODUCT_PER_PAGE = 9; // 3-column grid fills evenly

export default async function ProductListSupabase({
  searchParams,
  showPagination = true,
  limit,
  gridCols = 3,
}: {
  searchParams?: any;
  showPagination?: boolean;
  limit?: number;
  /** Number of columns on desktop — drives Tailwind grid class */
  gridCols?: 2 | 3 | 4;
}) {
  const supabase = supabaseServer();

  const page     = Number(searchParams?.page ?? 0);
  const rangeFrom = page * PRODUCT_PER_PAGE;
  const rangeTo   = rangeFrom + PRODUCT_PER_PAGE - 1;

  const name    = (searchParams?.name ?? '').trim();
  const min     = Number(searchParams?.min ?? 0);
  const max     = Number(searchParams?.max ?? 9_999_999);
  const sort    = (searchParams?.sort ?? '') as string;
  const catSlug = (searchParams?.cat ?? '').trim();

  let query = supabase
    .from('products')
    .select(
      'id, slug, name, description, price_cents, main_image_url',
      { count: showPagination ? 'exact' : undefined }
    )
    .gte('price_cents', min * 100)
    .lte('price_cents', max * 100);

  if (name) query = query.ilike('name', `${name}%`);

  if (catSlug) {
    const { data: cat, error: catErr } = await supabase
      .from('categories').select('id').eq('slug', catSlug).maybeSingle();
    if (catErr) throw new Error(`Failed to load category: ${catErr.message}`);

    if (cat?.id) {
      const { data: links, error: linkErr } = await supabase
        .from('product_categories').select('product_id').eq('category_id', cat.id);
      if (linkErr) throw new Error(`Failed to load category links: ${linkErr.message}`);

      const ids = (links ?? []).map((l) => l.product_id);
      query = ids.length ? query.in('id', ids) : query.in('id', [-1]);
    }
  }

  if (sort) {
    const [dir, col] = sort.split(' ');
    const ascending  = dir === 'asc';
    const mappedCol  =
      col === 'price' ? 'price_cents' :
      col === 'created_at' || col === 'lastUpdated' ? 'created_at' :
      'name';
    query = query.order(mappedCol, { ascending });
  }

  let items: any[] | null = null;
  let error: any = null;
  let count: number | null = null;

  if (typeof limit === 'number' && limit > 0) {
    ({ data: items, error } = await query.range(0, Math.max(0, limit - 1)));
  } else {
    ({ data: items, error, count } = await query.range(rangeFrom, rangeTo));
  }

  if (error) throw new Error(`Failed to load products: ${error.message}`);

  if (!items?.length) {
    return (
      <div className="py-20 text-center m-label text-[var(--m-subtle)]">
        No products available yet.
      </div>
    );
  }

  // Shape data for ProductCard — single image for now; add more via product_images table later
  const cards: ProductCardData[] = items.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? null,
    price_cents: p.price_cents,
    images: [resolveUrl(p.main_image_url)],
  }));

  const colClass =
    gridCols === 4 ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4' :
    gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    'grid-cols-2 lg:grid-cols-3'; // default (3)

  const hasPrev = page > 0;
  const hasNext = typeof count === 'number' ? rangeTo + 1 < count : false;

  return (
    <>
      <div className={`grid ${colClass} gap-5 md:gap-7`}>
        {cards.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {showPagination && !limit && (
        <Pagination currentPage={page} hasPrev={hasPrev} hasNext={hasNext} />
      )}
    </>
  );
}

// Resolve relative Supabase Storage paths to absolute URLs
function resolveUrl(url?: string | null): string {
  if (!url) return '/product.png';
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return `${base}/storage/v1/object/public/${url.replace(/^\/+/, '')}`;
}
