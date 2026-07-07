"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  price_cents: number;
  images: string[]; // ordered image URLs, index 0 = primary
  isNew?: boolean;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { slug, name, description, price_cents, images, isNew } = product;
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  // On hover switch to second image (if available), else stay on active
  const displayIdx = hovered && images.length > 1 ? (activeIdx === 0 ? 1 : 0) : activeIdx;

  const price = (price_cents / 100).toLocaleString("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });

  return (
    <Link href={`/${slug}`} className="group block">
      {/* Card shell */}
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm group-hover:shadow-lg transition-shadow duration-500">

        {/* Image area */}
        <div
          className="relative w-full bg-[var(--m-blush)] overflow-hidden"
          style={{ aspectRatio: "4 / 5" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Stacked images — crossfade via opacity */}
          {images.map((src, i) => (
            <div
              key={src + i}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === displayIdx ? 1 : 0 }}
            >
              <Image
                src={src}
                alt={`${name} — view ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}

          {/* NEW badge */}
          {isNew && (
            <span className="absolute top-4 left-4 z-10 px-2 py-1 bg-[var(--m-gold)] text-white m-label tracking-widest">
              NEW
            </span>
          )}

          {/* Image dot indicators — only when multiple images exist */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveIdx(i);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    i === displayIdx
                      ? "w-4 h-1.5 bg-[var(--m-gold)]"
                      : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="px-5 py-5 bg-white">
          <h3 className="font-display text-xl font-light leading-snug text-[var(--m-black)]">
            {name}
          </h3>

          {description && (
            <p className="mt-1.5 text-[var(--m-muted)] text-xs font-light leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="m-label text-[var(--m-muted)]">From {price}</span>
            <span className="m-label text-[var(--m-gold)] group-hover:underline underline-offset-4 transition-all duration-200 tracking-widest">
              SHOP →
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}
