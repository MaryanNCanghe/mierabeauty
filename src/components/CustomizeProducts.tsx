
"use client";

import React, { useMemo } from "react";

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

  /** Fallbacks para renderizar UI mesmo sem dados da DB */
  fallbackOptions?: {
    colors?: string[]; //  ["Red", "Blue", "Green"]
    sizes?: string[];  //  ["S", "M", "L", "XL"]
  };
};

export default function CustomizeProducts({
  variants,
  selectedVariantId,
  onChange,
  labels = { color: "Choose Color", size: "Choose Size" },
  colorToClassName,
  fallbackOptions,
}: Props) {
  const norm = useMemo(() => {
    const colorsDB = Array.from(new Set(
      variants.map(v => (v.color ?? "").trim()).filter(Boolean)
    ));
    const sizesDB = Array.from(new Set(
      variants.map(v => (v.size ?? "").trim()).filter(Boolean)
    ));

    const useFallback = colorsDB.length === 0 && sizesDB.length === 0;

    const colors = useFallback
      ? (fallbackOptions?.colors ?? [])
      : colorsDB;

    const sizes = useFallback
      ? (fallbackOptions?.sizes ?? [])
      : sizesDB;

    const selected = variants.find(v => v.id === selectedVariantId);
    const activeColor = (selected?.color ?? "").trim() || undefined;
    const activeSize  = (selected?.size  ?? "").trim() || undefined;

    return { useFallback, colors, sizes, selected, activeColor, activeSize };
  }, [variants, selectedVariantId, fallbackOptions]);

  // helpers
  const colorDotClass = (color: string) => {
    if (colorToClassName) return colorToClassName(color);
    const map: Record<string, string> = {
      red: "bg-red-600", blue: "bg-blue-500", green: "bg-green-600",
      pink: "bg-pink-400", black: "bg-black", white: "bg-white", gray: "bg-gray-400",
    };
    return map[color.toLowerCase()] ?? "bg-gray-300";
  };

  // seleção (apenas quando há variantes reais)
  function chooseColor(color: string) {
    if (norm.useFallback) return; // desativado
    const candidate = variants.find(v => (v.color ?? "").trim() === color && v.stock > 0);
    if (candidate) onChange(candidate.id);
  }
  function chooseSize(size: string) {
    if (norm.useFallback) return; // desativado
    const candidate = variants.find(v => (v.size ?? "").trim() === size && v.stock > 0);
    if (candidate) onChange(candidate.id);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* CORES */}
      <h4 className="z-title-md ">{labels.color ?? "Choose Color"}</h4>
      <ul className="flex items-center gap-3">
        {(norm.colors.length ? norm.colors : ["—"]).map(c => {
          const active = norm.activeColor?.toLowerCase() === c.toLowerCase();
          const disabled = norm.useFallback || c === "—";
          return (
            <li key={c} className="relative">
              <button
                type="button"
                aria-label={`Color ${c}`}
                aria-pressed={active}
                onClick={() => !disabled && chooseColor(c)}
                disabled={disabled}
                className={[
                  "w-8 h-8 rounded-full ring-1",
                  disabled ? "ring-pink-200 opacity-50 cursor-not-allowed" : (active ? "ring-lama" : "ring-gray-300"),
                  c !== "—" ? colorDotClass(c) : "bg-gray-200",
                ].join(" ")}
                title={c}
              />
              {active && !disabled && (
                <div className="pointer-events-none absolute w-10 h-10 rounded-full ring-2 ring-lama top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </li>
          );
        })}
      </ul>
      {norm.useFallback && (
        <div className="z-label text-gray-500">Cores indisponíveis de momento.</div>
      )}

      {/* TAMANHOS */}
      <h4 className="z-title-md">{labels.size ?? "Choose Size"}</h4>
      <ul className="flex items-center gap-3">
        {(norm.sizes.length ? norm.sizes : ["—"]).map(s => {
          const active = norm.activeSize?.toLowerCase() === s.toLowerCase();
          const disabled = norm.useFallback || s === "—";
          return (
            <li key={s}>
              <button
                type="button"
                onClick={() => !disabled && chooseSize(s)}
                disabled={disabled}
                aria-pressed={active}
                className={[
                  "z-btn--secondary rounded-1 py-1 px-4 text-sm ring-1",
                  disabled
                    ? "z-btn--primary cursor-not-allowed"
                    : (active ? "ring-black bg-white text-white" : "ring-black text-white"),
                ].join(" ")}
              >
                {s}
              </button>
            </li>
          );
        })}
      </ul>
      {norm.useFallback && (
        <div className="z-label text-gray-500">Tamanhos indisponíveis de momento.</div>
      )}
    </div>
  );
}
