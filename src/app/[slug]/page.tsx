
// src/app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ProductImages, { ProductImageItem } from '@/components/ProductImages';
import ClientProductControls from '@/components/ClientProductControls';
import ProductListSupabase from '@/components/ProductList';

function formatEUR(cents?: number | null) {
  if (cents == null) return '€0,00';
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

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

  const leadingPriceCents =
    variantItems.length > 0
      ? Math.min(...variantItems.map((v) => v.priceCents))
      : product.price_cents;

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
          <span className="m-label text-[var(--m-gold)]">Beauty</span>

          {/* Product title — Cormorant display */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-[var(--m-black)]">
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

          <div className="h-px bg-[var(--m-gold)]/20" />

          {/* Price */}
          <p className="font-display text-2xl font-light text-[var(--m-black)]">
            {formatEUR(leadingPriceCents)}
          </p>

          <div className="h-px bg-[var(--m-gold)]/20" />

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
          />

          <div className="h-px bg-[var(--m-gold)]/20" />

          {/* Product details */}
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="m-title-sm mb-2 text-[var(--m-black)]">Ingredients</h4>
              <p className="m-label text-[var(--m-muted)] leading-relaxed">
                Natural &amp; ethically sourced ingredients. Dermatologist tested. Cruelty-free.
              </p>
            </div>
            <div>
              <h4 className="m-title-sm mb-2 text-[var(--m-black)]">Shipping</h4>
              <p className="m-label text-[var(--m-muted)] leading-relaxed">
                Dispatched within 24–48h. Free returns within 30 days.
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
