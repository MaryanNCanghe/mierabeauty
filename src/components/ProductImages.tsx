
// src/components/ProductImages.tsx
'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ProductImageItem = {
  id: string | number;
  url: string;
  alt?: string;
};

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M11 2L2 12L11 22' : 'M3 2L12 12L3 22'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function ProductImages({ items }: { items: ProductImageItem[] | undefined | null }) {
  const normalized = useMemo<ProductImageItem[]>(() => {
    if (Array.isArray(items) && items.length > 0) return items;
    return [{ id: 'fallback', url: '/product.png', alt: 'Product image' }];
  }, [items]);

  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasMultiple = normalized.length > 1;

  useEffect(() => setMounted(true), []);
  useEffect(() => setIndex(0), [normalized.length]);

  const current = normalized[index] ?? normalized[0];
  const clamp = (i: number) => Math.max(0, Math.min(normalized.length - 1, i));
  const goNext = () => setIndex((p) => clamp(p + 1));
  const goPrev = () => setIndex((p) => clamp(p - 1));

  // Keyboard nav — arrows switch images, Escape closes the lightbox.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') setLightboxOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [normalized.length]);

  // Horizontal swipe on the hero image — mobile-conventional (replaces the
  // old vertical-swipe gesture; there's no more wheel-hijacking either).
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? goPrev() : goNext());
    touchStartX.current = null;
  };

  return (
    <div className="relative flex gap-4 lg:gap-6">
      {/* Desktop/tablet thumbnail column — smaller, switches on click only */}
      {hasMultiple && (
        <div className="hidden lg:flex flex-col gap-2 w-16 flex-shrink-0">
          {normalized.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={[
                'relative w-full aspect-[4/5] rounded-md overflow-hidden ring-1 transition-colors',
                i === index ? 'ring-[var(--m-gold)] ring-2' : 'ring-gray-200 hover:ring-neutral-400',
              ].join(' ')}
            >
              <Image src={img.url} alt={img.alt ?? `Image ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image + mobile thumbnail strip */}
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-label="View full image"
          className="relative w-full rounded-md overflow-hidden block cursor-zoom-in bg-[var(--m-blush)]"
        >
          {/* No `fill` + forced aspect box here on purpose — a fixed ratio
              either crops (object-cover) or letterboxes (object-contain)
              whenever a photo's real proportions differ from it. width/
              height below only seed Next's optimizer target size; w-full
              h-auto makes the box follow the image's own natural ratio, so
              the full photo always shows with no crop and no gutter. */}
          <Image
            src={current.url}
            alt={current.alt ?? 'Product image'}
            width={1000}
            height={1250}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="w-full h-auto"
            priority={index === 0}
          />
        </button>

        {/* Mobile "slide bar" of thumbnails — tap to switch */}
        {hasMultiple && (
          <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {normalized.map((img, i) => (
              <button
                key={img.id}
                type="button"
                aria-label={`View image ${i + 1}`}
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={[
                  'relative flex-shrink-0 w-14 aspect-[4/5] rounded-md overflow-hidden ring-1 transition-colors',
                  i === index ? 'ring-[var(--m-gold)] ring-2' : 'ring-gray-200',
                ].join(' ')}
              >
                <Image src={img.url} alt={img.alt ?? `Image ${i + 1}`} fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-width lightbox */}
      {mounted &&
        lightboxOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute top-6 right-6 z-10 text-white/80 hover:text-white transition-colors p-2"
            >
              <CloseIcon />
            </button>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous image"
                  className="absolute left-2 md:left-8 z-10 text-white/70 hover:text-white transition-colors p-2"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next image"
                  className="absolute right-2 md:right-8 z-10 text-white/70 hover:text-white transition-colors p-2"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}

            {/* No stopPropagation here on purpose — tapping the photo
                itself should also close the lightbox, same as the backdrop. */}
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-6">
              <Image
                src={current.url}
                alt={current.alt ?? 'Product image'}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
