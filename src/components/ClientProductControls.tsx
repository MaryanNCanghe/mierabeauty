
"use client";

import { useMemo, useState } from "react";
import CustomizeProducts from "@/components/CustomizeProducts";
import ProductTierSelectors from "@/components/ProductTierSelectors";
import Add from "@/components/Add";
import { useCurrency } from "@/contexts/currency";
import {
  computeCustomizedUnitPriceCents,
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
  const [qty, setQty] = useState(1);

  const hasCustomizer = customizerMode !== "none";

  const effectivePriceCents = useMemo(
    () =>
      computeCustomizedUnitPriceCents({
        baseVariantPriceCents: selectedVariant?.priceCents ?? 0,
        qualityTierId: hasCustomizer ? qualityTierId : null,
        densityTierId: customizerMode === "density" ? densityTierId : null,
      }),
    [selectedVariant, qualityTierId, densityTierId, customizerMode, hasCustomizer]
  );

  return (
    <>
      <CustomizeProducts
        variants={variants}
        selectedVariantId={selectedVariantId}
        onChange={setSelectedVariantId}
      />

      {hasCustomizer && (
        <ProductTierSelectors
          mode={customizerMode === "density" ? "density" : "grams"}
          qualityTierId={qualityTierId}
          onQualityTierChange={setQualityTierId}
          densityTierId={densityTierId}
          onDensityTierChange={setDensityTierId}
          qty={qty}
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
        attributesOverride={
          hasCustomizer
            ? {
                qualityTier: QUALITY_TIERS.find((t) => t.id === qualityTierId)!.label,
                ...(customizerMode === "density"
                  ? { density: DENSITY_TIERS.find((t) => t.id === densityTierId)!.percentLabel }
                  : { gramsMode: "true" }),
              }
            : undefined
        }
        onQtyChange={setQty}
      />

      <div className="z-label text-gray-600">
        Price: {format(hasCustomizer ? effectivePriceCents : selectedVariant?.priceCents ?? 0)}
      </div>
    </>
  );
}
