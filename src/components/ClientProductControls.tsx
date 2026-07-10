
"use client";

import { useMemo, useState } from "react";
import CustomizeProducts from "@/components/CustomizeProducts";
import Add from "@/components/Add";
import { useCurrency } from "@/contexts/currency";

export default function ClientProductControls({
  product,
  variants,
}: {
  product: { id: number; slug: string; name: string; imageUrl?: string };
  variants: { id: number; color?: string; size?: string; stock: number; priceCents: number }[];
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(variants[0]?.id);
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId]
  );
  const { format } = useCurrency();

  return (
    <>
      <CustomizeProducts
        variants={variants}
        selectedVariantId={selectedVariantId}
        onChange={setSelectedVariantId}
      />

      <Add
        productId={product.id}
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl}
        variants={variants}
        selectedVariantId={selectedVariantId} // controlado
      />

      <div className="z-label text-gray-600">
        Variant price: {format(selectedVariant?.priceCents ?? 0)}
      </div>
    </>
  );
}
