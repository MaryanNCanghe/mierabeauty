
"use client";

import React, { useMemo } from "react";
import { STANDARD_HAIR_COLORS, STANDARD_LENGTHS_IN, colorNameToSwatchClassName } from "@/lib/hairCustomization";

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
  labels?: { color?: string; size?: string };
  colorToClassName?: (color?: string | null) => string;
  /** Full standard option sets to render (with per-value availability), instead of only whatever values exist in `variants`. */
  standardColors?: string[];
  standardLengths?: string[];
};

/** Hair lengths are stored as a plain inch value (e.g. "18"); render both units. */
function formatSize(size: string): string {
  const inches = Number(size);
  if (!Number.isNaN(inches) && inches > 0) {
    const cm = Math.round(inches * 2.54);
    return `${inches}" / ${cm}cm`;
  }
  return size;
}

export default function CustomizeProducts({
  variants,
  selectedVariantId,
  onChange,
  labels = { color: "Choose Color", size: "Choose Size" },
  colorToClassName,
  standardColors = STANDARD_HAIR_COLORS.map((c) => c.name),
  standardLengths = STANDARD_LENGTHS_IN.map(String),
}: Props) {
  const norm = useMemo(() => {
    const colors = Array.from(new Set(
      variants.map(v => (v.color ?? "").trim()).filter(Boolean)
    ));
    const sizes = Array.from(new Set(
      variants.map(v => (v.size ?? "").trim()).filter(Boolean)
    ));

    const selected = variants.find(v => v.id === selectedVariantId);
    const activeColor = (selected?.color ?? "").trim() || undefined;
    const activeSize  = (selected?.size  ?? "").trim() || undefined;

    return { colors, sizes, selected, activeColor, activeSize };
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
    // Prefer keeping the current size when switching color, if that combo exists in stock
    const sameSize = norm.activeSize;
    const candidate =
      variants.find(v => (v.color ?? "").trim() === color && (v.size ?? "").trim() === sameSize && v.stock > 0) ??
      variants.find(v => (v.color ?? "").trim() === color && v.stock > 0);
    if (candidate) onChange(candidate.id);
  }
  function chooseSize(size: string) {
    const sameColor = norm.activeColor;
    const candidate =
      variants.find(v => (v.size ?? "").trim() === size && (v.color ?? "").trim() === sameColor && v.stock > 0) ??
      variants.find(v => (v.size ?? "").trim() === size && v.stock > 0);
    if (candidate) onChange(candidate.id);
  }

  if (norm.colors.length === 0 && norm.sizes.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* COLOR — only rendered when this product actually has color variants at all;
          shows the full standard palette, disabling any shade with no in-stock variant. */}
      {norm.colors.length > 0 && (
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
      )}

      {/* SIZE — only rendered when this product actually has size variants at all;
          shows the full standard length range, disabling any length with no in-stock variant. */}
      {norm.sizes.length > 0 && (
        <div>
          <h4 className="z-title-md mb-3">{labels.size ?? "Choose Size"}</h4>
          <ul className="flex items-center gap-3 flex-wrap">
            {standardLengths.map(s => {
              const active = norm.activeSize?.toLowerCase() === s.toLowerCase();
              const inStock = variants.some(
                v => (v.size ?? "").trim().toLowerCase() === s.toLowerCase() && v.stock > 0
              );
              return (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => chooseSize(s)}
                    aria-pressed={active}
                    disabled={!inStock}
                    className={[
                      "rounded py-1.5 px-4 text-sm ring-1 transition-colors",
                      active
                        ? "ring-[var(--m-black)] bg-[var(--m-black)] text-white"
                        : "ring-gray-300 text-[var(--m-black)] hover:ring-[var(--m-black)]",
                      inStock ? "" : "opacity-30 cursor-not-allowed hover:ring-gray-300",
                    ].join(" ")}
                    title={inStock ? undefined : "Currently unavailable"}
                  >
                    {formatSize(s)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
