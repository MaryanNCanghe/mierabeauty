
// src/app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ProductImages, { ProductImageItem } from '@/components/ProductImages';
import ClientProductControls from '@/components/ClientProductControls';
import ProductListSupabase from '@/components/ProductList';
import { customizerModeForCategorySlug } from '@/lib/hairCustomization';

// Monta URL pública do Storage se vier apenas caminho; mantém URLs absolutas (http...)
function resolveImageUrl(url: string): string {
  if (!url) return '/product.png';
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${url.replace(/^\/+/, '')}`;
}

export default async function SinglePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase = supabaseServer();

  // Produto
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, slug, name, description, price_cents, main_image_url')
    .eq('slug', slug)
    .maybeSingle();

  if (prodErr) throw new Error(`Failed to load product: ${prodErr.message}`);
  if (!product) notFound();

  const { data: images, error: imgErr } = await supabase
    .from('product_images')
    .select('id, url, alt, sort_order')
    .eq('product_id', product.id)
    .order('sort_order', { ascending: true });

  if (imgErr) console.warn('Failed to load images:', imgErr.message);

  const { data: variants, error: varErr } = await supabase
    .from('product_variants')
    .select('id, color, size, price_cents, stock')
    .eq('product_id', product.id)
    .order('id', { ascending: true });

  if (varErr) console.warn('Failed to load variants:', varErr.message);

  // Resolve this product's Hair subcategory (if any) to decide customizer mode.
  const { data: catLinks, error: catLinkErr } = await supabase
    .from('product_categories')
    .select('categories(slug, name, parent_id)')
    .eq('product_id', product.id);

  if (catLinkErr) console.warn('Failed to load product categories:', catLinkErr.message);

  const hairCategory = (catLinks ?? [])
    .map((l: any) => l.categories)
    .find((c: any) => c && c.parent_id != null);

  const categoryName: string = hairCategory?.name ?? 'Hair';
  const customizerMode = customizerModeForCategorySlug(hairCategory?.slug ?? null);

  // Constrói itens de imagem com URL absoluta
  const hasGallery = Array.isArray(images) && images.length > 0;
  const resolvedMainUrl = product.main_image_url ? resolveImageUrl(product.main_image_url) : null;

  const imageItems: ProductImageItem[] =
    hasGallery
      ? (images ?? []).map((img) => ({
          id: img.id,
          url: resolveImageUrl(img.url),
          alt: img.alt ?? product.name,
        }))
      : resolvedMainUrl
        ? [{ id: 'main', url: resolvedMainUrl, alt: product.name }]
        : [{ id: 'fallback', url: '/product.png', alt: product.name }];

  // Constrói variantes (se existirem)
  const variantItems =
    variants?.map((v) => ({
      id: v.id,
      color: v.color ?? undefined,
      size: v.size ?? undefined,
      stock: v.stock ?? 0,
      priceCents: v.price_cents ?? product.price_cents,
    })) ?? [];


  return (
    <>
      {/* ── Two-column layout pushed below fixed navbar ── */}
      <div className="pt-20 md:pt-24 pb-16 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">

        {/* Image column — sticky on desktop */}
        <div className="w-full lg:w-1/2 flex-shrink-0">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductImages items={imageItems} objectFit="cover" />
          </div>
        </div>

        {/* Info column */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">

          {/* Breadcrumb-style label */}
          <span className="m-label text-[var(--m-gold)]">{categoryName}</span>

          {/* Product title — Cormorant display */}
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-light leading-tight text-[var(--m-black)]">
            {product.name}
          </h1>

          {/* Description */}
          {product.description ? (
            <p className="text-[var(--m-muted)] text-sm font-light leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          ) : (
            <p className="m-label text-[var(--m-subtle)]">No description available.</p>
          )}

          {/* Price now rendered inside ClientProductControls — it reacts live
              to color/length/quality/density/grams instead of being fixed. */}

          {/* Variant selector + add to cart */}
          <ClientProductControls
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: resolvedMainUrl ?? imageItems[0]?.url ?? '/product.png',
            }}
            variants={
              variantItems.length
                ? variantItems
                : [{ id: product.id, priceCents: product.price_cents, stock: 9999 }]
            }
            customizerMode={customizerMode}
          />

          <div className="h-px bg-[var(--m-gold)]/20" />

          {/* Product details */}
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="m-title-sm mb-2 text-[var(--m-black)]">Ingredients</h4>
              <p className="m-label text-[var(--m-muted)] leading-relaxed">
                100% Real, Raw Virgin Human Hair — ethically sourced from a single donor, cuticles kept
                fully intact and aligned in one direction for natural movement with no shedding or
                tangling. Unprocessed and chemical-free, so it can be washed, styled, and coloured just
                like your own hair. Dermatologically tested. Cruelty-free.
              </p>
            </div>
            <div>
              <h4 className="m-title-sm mb-2 text-[var(--m-black)]">Shipping</h4>
              <p className="m-label text-[var(--m-muted)] leading-relaxed">
                Dispatched within 24–48h. Delivery expected within 6 to 10 days. Free returns within 30 days.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Related products ── */}
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-20 border-t border-[var(--m-gold)]/15">
        <h2 className="m-section-title m-section-title--underline mb-10">You May Also Like</h2>
        <ProductListSupabase limit={4} showPagination={false} gridCols={4} />
      </div>
    </>
  );
}
