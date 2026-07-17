
"use client";

import { useMemo, useState } from "react";
import CustomizeProducts from "@/components/CustomizeProducts";
import ProductTierSelectors from "@/components/ProductTierSelectors";
import Add from "@/components/Add";
import { useCurrency } from "@/contexts/currency";
import {
  computeCustomizedUnitPriceCents,
  computeLengthSurchargeCents,
  formatLengthLabel,
  STANDARD_LENGTHS_IN,
  GRAMS_PER_UNIT,
  QUALITY_TIERS,
  DENSITY_TIERS,
  type QualityTierId,
  type DensityTierId,
  type CustomizerMode,
} from "@/lib/hairCustomization";

export default function ClientProductControls({
  product,
  variants,
  customizerMode = "none",
}: {
  product: { id: number; slug: string; name: string; imageUrl?: string };
  variants: { id: number; color?: string; size?: string; stock: number; priceCents: number }[];
  customizerMode?: CustomizerMode;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(variants[0]?.id);
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId]
  );
  const { format } = useCurrency();

  const [qualityTierId, setQualityTierId] = useState<QualityTierId>("standard");
  const [densityTierId, setDensityTierId] = useState<DensityTierId>("130");
  const [lengthIn, setLengthIn] = useState<number>(STANDARD_LENGTHS_IN[0]);
  const [grams, setGrams] = useState<number>(GRAMS_PER_UNIT);

  const hasCustomizer = customizerMode !== "none";
  const isGramsMode = customizerMode === "grams";

  // Length is now a flat formulaic surcharge, not tied to a specific DB
  // variant — the base is the product's cheapest real variant price,
  // treated as the anchor for the shortest standard length.
  const baseVariantPriceCents = useMemo(
    () => Math.min(...variants.map((v) => v.priceCents)),
    [variants]
  );

  const stock = selectedVariant?.stock ?? 0;
  const isOutOfStock = stock < 1;
  const maxGrams = (isOutOfStock ? 10 : Math.max(1, stock)) * GRAMS_PER_UNIT;

  // Per-GRAMS_PER_UNIT-unit price (e.g. price for one 100g bundle) — this is
  // what actually gets charged per cart-quantity unit. Grams scaling is
  // applied only for display below, via the cart's own qty mechanism
  // (qtyOverride = grams / GRAMS_PER_UNIT), never baked in twice.
  const effectivePriceCents = useMemo(
    () =>
      computeCustomizedUnitPriceCents({
        baseVariantPriceCents: hasCustomizer ? baseVariantPriceCents : selectedVariant?.priceCents ?? 0,
        lengthSurchargeCents: hasCustomizer ? computeLengthSurchargeCents(lengthIn) : 0,
        qualityTierId: hasCustomizer ? qualityTierId : null,
        densityTierId: customizerMode === "density" ? densityTierId : null,
      }),
    [hasCustomizer, baseVariantPriceCents, selectedVariant, lengthIn, qualityTierId, densityTierId, customizerMode]
  );

  const displayPriceCents = isGramsMode
    ? effectivePriceCents * (grams / GRAMS_PER_UNIT)
    : effectivePriceCents;

  return (
    <>
      <CustomizeProducts
        variants={variants}
        selectedVariantId={selectedVariantId}
        onChange={setSelectedVariantId}
      />

      {hasCustomizer && (
        <div>
          <h4 className="z-title-md mb-3">Choose Length</h4>
          <select
            value={lengthIn}
            onChange={(e) => setLengthIn(Number(e.target.value))}
            className="w-full max-w-xs border border-gray-300 rounded py-2 px-3 text-sm bg-white"
          >
            {STANDARD_LENGTHS_IN.map((len) => (
              <option key={len} value={len}>
                {formatLengthLabel(len)}
                {len > STANDARD_LENGTHS_IN[0] ? ` (+${format(computeLengthSurchargeCents(len))})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasCustomizer && (
        <ProductTierSelectors
          mode={customizerMode === "density" ? "density" : "grams"}
          qualityTierId={qualityTierId}
          onQualityTierChange={setQualityTierId}
          densityTierId={densityTierId}
          onDensityTierChange={setDensityTierId}
          grams={grams}
          onGramsChange={setGrams}
          maxGrams={maxGrams}
        />
      )}

      <Add
        productId={product.id}
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl}
        variants={variants}
        selectedVariantId={selectedVariantId} // controlado
        priceCentsOverride={hasCustomizer ? effectivePriceCents : undefined}
        qtyOverride={isGramsMode ? grams / GRAMS_PER_UNIT : undefined}
        attributesOverride={
          hasCustomizer
            ? {
                size: String(lengthIn),
                qualityTier: QUALITY_TIERS.find((t) => t.id === qualityTierId)!.label,
                ...(customizerMode === "density"
                  ? { density: DENSITY_TIERS.find((t) => t.id === densityTierId)!.percentLabel }
                  : { gramsMode: "true" }),
              }
            : undefined
        }
      />

      <div className="z-label text-gray-600">
        Price: {format(hasCustomizer ? displayPriceCents : selectedVariant?.priceCents ?? 0)}
      </div>
    </>
  );
}
