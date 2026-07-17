
"use client";

import React, { useMemo } from "react";
import { STANDARD_HAIR_COLORS, colorNameToSwatchClassName } from "@/lib/hairCustomization";

export type VariantOption = {
  id: number;
  color?: string | null;
  size?: string | null;
  stock: number;
  priceCents: number;
};

type Props = {
  variants: VariantOption[];
  selectedVariantId?: number;
  onChange: (variantId: number) => void;
  labels?: { color?: string };
  colorToClassName?: (color?: string | null) => string;
  /** Full standard color set to render (with per-value availability), instead of only whatever values exist in `variants`. */
  standardColors?: string[];
};

export default function CustomizeProducts({
  variants,
  selectedVariantId,
  onChange,
  labels = { color: "Choose Color" },
  colorToClassName,
  standardColors = STANDARD_HAIR_COLORS.map((c) => c.name),
}: Props) {
  const norm = useMemo(() => {
    const colors = Array.from(new Set(
      variants.map(v => (v.color ?? "").trim()).filter(Boolean)
    ));

    const selected = variants.find(v => v.id === selectedVariantId);
    const activeColor = (selected?.color ?? "").trim() || undefined;

    return { colors, selected, activeColor };
  }, [variants, selectedVariantId]);

  const colorDotClass = (color: string) => {
    if (colorToClassName) return colorToClassName(color);
    const map: Record<string, string> = {
      red: "bg-red-600", blue: "bg-blue-500", green: "bg-green-600",
      pink: "bg-pink-400", black: "bg-black", white: "bg-white", gray: "bg-gray-400",
      "natural black": "bg-black",
      "dark brown": "bg-[#3B2A20]",
      "chestnut brown": "bg-[#6B3E26]",
      burgundy: "bg-[#5C1A2E]",
    };
    return colorNameToSwatchClassName(color) ?? map[color.toLowerCase()] ?? "bg-gray-300";
  };

  function chooseColor(color: string) {
    const candidate = variants.find(v => (v.color ?? "").trim() === color && v.stock > 0);
    if (candidate) onChange(candidate.id);
  }

  if (norm.colors.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* COLOR — only rendered when this product actually has color variants at all;
          shows the full standard palette, disabling any shade with no in-stock variant. */}
      <div>
        <h4 className="z-title-md mb-3">{labels.color ?? "Choose Color"}</h4>
        <ul className="flex items-center gap-3 flex-wrap">
          {standardColors.map(c => {
            const active = norm.activeColor?.toLowerCase() === c.toLowerCase();
            const inStock = variants.some(
              v => (v.color ?? "").trim().toLowerCase() === c.toLowerCase() && v.stock > 0
            );
            return (
              <li key={c} className="relative">
                <button
                  type="button"
                  aria-label={`Color ${c}`}
                  aria-pressed={active}
                  disabled={!inStock}
                  onClick={() => chooseColor(c)}
                  className={[
                    "w-8 h-8 rounded-full ring-1",
                    active ? "ring-[var(--m-gold)] ring-2" : "ring-gray-300",
                    inStock ? "" : "opacity-30 cursor-not-allowed",
                    colorDotClass(c),
                  ].join(" ")}
                  title={inStock ? c : `${c} (currently unavailable)`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
