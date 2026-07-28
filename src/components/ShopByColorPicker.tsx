"use client";

import { useMemo, useState } from "react";
import ColorSwatchButton from "@/components/ColorSwatchButton";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import { STANDARD_HAIR_COLORS, COLOR_BLEND_MATCHES } from "@/lib/hairCustomization";

type ColorProduct = ProductCardData & { color_name: string };

export default function ShopByColorPicker({ products }: { products: ColorProduct[] }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const matches = useMemo(() => {
    if (!selectedColor) return [];
    const blendNames = new Set(COLOR_BLEND_MATCHES[selectedColor] ?? [selectedColor]);
    return products.filter((p) => blendNames.has(p.color_name));
  }, [selectedColor, products]);

  return (
    <div>
      <p className="m-label text-[var(--m-subtle)] mb-5">
        Pick your natural shade — we&apos;ll show you the pieces that blend seamlessly.
      </p>

      <ul className="flex items-center gap-3 flex-wrap">
        {STANDARD_HAIR_COLORS.map((c) => (
          <li key={c.name}>
            <ColorSwatchButton
              name={c.name}
              active={selectedColor === c.name}
              onClick={() => setSelectedColor(c.name)}
            />
          </li>
        ))}
      </ul>

      {selectedColor && (
        <div className="mt-10">
          {matches.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
              {matches.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="m-label text-[var(--m-subtle)]">
              No matches yet for this shade — check back soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
