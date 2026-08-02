// src/components/ProductList.tsx
import { supabaseServer } from '@/lib/supabase/server';
import Pagination from './Pagination';
import ProductCard, { type ProductCardData } from './ProductCard';

const PRODUCT_PER_PAGE = 12; // 3-column grid fills evenly

export default async function ProductListSupabase({
  searchParams,
  showPagination = true,
  limit,
  gridCols = 3,
  oneProductPerStyle = false,
}: {
  searchParams?: any;
  showPagination?: boolean;
  limit?: number;
  /** Number of columns on desktop — drives Tailwind grid class */
  gridCols?: 2 | 3 | 4;
  /** When true, shows at most one color per style (color_group_id) instead
   * of e.g. every color of the same Straight Bundle — for sections like New
   * Arrivals where variety matters more than showing every color. Products
   * without a color_group_id are always unique on their own. */
  oneProductPerStyle?: boolean;
}) {
  const supabase = supabaseServer();

  const page     = Number(searchParams?.page ?? 0);
  const rangeFrom = page * PRODUCT_PER_PAGE;
  const rangeTo   = rangeFrom + PRODUCT_PER_PAGE - 1;

  const name        = (searchParams?.name ?? '').trim();
  const min         = Number(searchParams?.min ?? 0);
  const max         = Number(searchParams?.max ?? 9_999_999);
  const sort        = (searchParams?.sort ?? '') as string;
  const catSlug     = (searchParams?.cat ?? '').trim();
  const textureSlug = (searchParams?.texture ?? '').trim();

  let query = supabase
    .from('products')
    .select(
      'id, slug, name, description, price_cents, main_image_url, color_group_id, created_at',
      { count: showPagination ? 'exact' : undefined }
    )
    .gte('price_cents', min * 100)
    .lte('price_cents', max * 100);

  if (name) query = query.ilike('name', `%${name}%`);

  // Texture is a plain column on products, independent of category — a
  // separate, combinable filter (e.g. Clip-Ins + Straight together).
  if (textureSlug) query = query.eq('texture', textureSlug);

  if (catSlug) {
    const { data: cat, error: catErr } = await supabase
      .from('categories').select('id').eq('slug', catSlug).maybeSingle();
    if (catErr) throw new Error(`Failed to load category: ${catErr.message}`);

    if (cat?.id) {
      // Selecting a parent category also matches products tagged with any of its subcategories
      const { data: family, error: familyErr } = await supabase
        .from('categories').select('id').or(`id.eq.${cat.id},parent_id.eq.${cat.id}`);
      if (familyErr) throw new Error(`Failed to load category family: ${familyErr.message}`);

      const categoryIds = (family ?? []).map((c) => c.id);

      const { data: links, error: linkErr } = await supabase
        .from('product_categories').select('product_id').in('category_id', categoryIds);
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
  } else if (oneProductPerStyle) {
    // "New Arrivals" should actually mean newest first, and picking the
    // newest per style keeps whichever color was added most recently.
    query = query.order('created_at', { ascending: false });
  }

  let items: any[] | null = null;
  let error: any = null;
  let count: number | null = null;

  if (oneProductPerStyle && typeof limit === 'number' && limit > 0) {
    // Fetch a larger candidate pool, then keep one product per
    // color_group_id so the same style doesn't show up in several colors —
    // ungrouped products are always their own group. Styles are ordered by
    // their newest color (import batches insert colors in a fixed order,
    // so always taking the newest would show the same color, e.g. platinum
    // blonde, for every style) — the displayed color is picked at random
    // from that style's available colors for real variety.
    const { data: candidates, error: candErr } = await query.range(0, Math.max(0, limit * 10 - 1));
    error = candErr;
    if (candidates) {
      const groupOrder: string[] = [];
      const groups = new Map<string, any[]>();
      for (const p of candidates) {
        const key = p.color_group_id ?? `product-${p.id}`;
        if (!groups.has(key)) {
          groups.set(key, []);
          groupOrder.push(key);
        }
        groups.get(key)!.push(p);
      }
      const deduped: any[] = [];
      for (const key of groupOrder) {
        const members = groups.get(key)!;
        deduped.push(members[Math.floor(Math.random() * members.length)]);
        if (deduped.length >= limit) break;
      }
      items = deduped;
    }
  } else if (typeof limit === 'number' && limit > 0) {
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
      <div className={`grid ${colClass} gap-3 sm:gap-5 md:gap-7`}>
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
