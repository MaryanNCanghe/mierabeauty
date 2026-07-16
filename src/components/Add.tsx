
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart";

type Variant = {
  id: number;
  color?: string;
  size?: string;
  priceCents: number;
  stock: number;
};

export default function Add(props: {
  productId: number;
  slug: string;
  name: string;
  imageUrl?: string;
  variants: Variant[];
  selectedVariantId: number; // <-- controlado pelo parent
  priceCentsOverride?: number;
  attributesOverride?: Record<string, string | number | undefined>;
  onQtyChange?: (qty: number) => void;
}) {
  const { productId, slug, name, imageUrl, variants, selectedVariantId } = props;
  const cart = useCart();

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId]
  );

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    props.onQtyChange?.(quantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity]);

  const stock = selectedVariant?.stock ?? 0;
  const isOutOfStock = stock < 1;
  const MAX_PREORDER_QTY = 10;
  const canDecrease = quantity > 1;
  const canIncrease = isOutOfStock ? quantity < MAX_PREORDER_QTY : quantity < stock;
  const unitPriceCents = props.priceCentsOverride ?? selectedVariant?.priceCents ?? 0;

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant || quantity < 1) return;

    cart.addItem(
      {
        productId,
        variantId: selectedVariant.id,
        slug,
        name,
        priceCents: unitPriceCents,
        imageUrl,
        attributes: {
          color: selectedVariant.color,
          size: selectedVariant.size,
          ...(props.attributesOverride ?? {}),
          ...(isOutOfStock ? { preorder: "true" } : {}),
        },
      },
      quantity
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="z-title-md">Quantity</h4>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
            <button
              type="button"
              className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
              onClick={() => canDecrease && setQuantity((p) => p - 1)}
              disabled={!canDecrease}
              aria-label="Decrease quantity"
            >
              -
            </button>
            {quantity}
            <button
              type="button"
              className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
              onClick={() => canIncrease && setQuantity((p) => p + 1)}
              disabled={!canIncrease}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {isOutOfStock && (
            <div className="text-xs text-[var(--m-muted)]">
              Currently sold out — pre-order takes longer to arrive
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={quantity < 1}
          className="w-36 z-label-1 z-btn--primary disabled:cursor-not-allowed disabled:bg-grey-200 disabled:ring-0 disabled:text-white"
        >
          {isOutOfStock ? "Pre-Order" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
