
// src/components/ProductImages.tsx
'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

export type ProductImageItem = {
  id: string | number;
  url: string;
  alt?: string;
};

type Props = {
  items: ProductImageItem[] | undefined | null;
  mainHeight?: number;   // opcional: força altura px
  thumbHeight?: number;
  objectFit?: 'cover' | 'contain';
};

export default function ProductImages({
  items,
  mainHeight,           // se não passar, usa vh responsivo
  thumbHeight = 128,
  objectFit = 'cover',
}: Props) {
  const normalized = useMemo<ProductImageItem[]>(() => {
    if (Array.isArray(items) && items.length > 0) return items;
    return [{ id: 'fallback', url: '/product.png', alt: 'Product image' }];
  }, [items]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [normalized.length]);

  const current = normalized[index] ?? normalized[0];

  const clamp = (i: number) => Math.max(0, Math.min(normalized.length - 1, i));
  const goNext = () => setIndex((p) => clamp(p + 1));
  const goPrev = () => setIndex((p) => clamp(p - 1));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setIndex((p) => clamp(p - 1));
      if (e.key === 'ArrowRight') setIndex((p) => clamp(p + 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [normalized.length]);

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 3) return;
    e.deltaY > 0 ? goNext() : goPrev();
  };
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > 24) (dy > 0 ? goPrev() : goNext());
    touchStartY.current = null;
  };

  return (
    <div className="mt-20 relative flex gap-4 lg:gap-8">
      {/* Principal */}
      <div
        className={[
          'relative flex-1 rounded-md overflow-hidden',
          mainHeight ? '' : 'h-[90vh] lg:h-[calc(100vh-8rem)]',
        ].join(' ')}
        style={mainHeight ? { height: `${mainHeight}px` } : undefined}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={current.url}
          alt={current.alt ?? 'Product image'}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={objectFit === 'cover' ? 'object-cover' : 'object-contain'}
          priority={index === 0}
        />
      </div>

      {/* Thumbs (desktop) */}
      {normalized.length > 1 && (
        <div className="hidden lg:flex flex-col gap-3 w-24">
          {normalized.slice(0, 6).map((img, i) => {
            const selected = i === index;
            return (
              <button
                key={img.id}
                type="button"
                aria-label={`Imagem ${i + 1}`}
                aria-selected={selected}
                onMouseEnter={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                onClick={() => setIndex(i)}
                className={[
                  'relative w-full rounded-md overflow-hidden ring-1 transition-colors',
                  selected ? 'ring-neutral-800' : 'ring-gray-200 hover:ring-neutral-500',
                ].join(' ')}
                style={{ height: `${thumbHeight}px` }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={img.url}
                    alt={img.alt ?? `Imagem ${i + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
