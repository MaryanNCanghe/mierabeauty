
"use client";

import { useMemo, useState } from "react";
import CustomizeProducts from "@/components/CustomizeProducts";
import Add from "@/components/Add";

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

      {/* preço dinâmico (opcional) */}
      <div className="z-label text-gray-600">
        Preço da variante:{" "}
        {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
          (selectedVariant?.priceCents ?? 0) / 100
        )}
      </div>
    </>
  );
}
