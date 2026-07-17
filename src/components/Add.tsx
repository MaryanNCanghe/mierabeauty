
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart";
import { GRAMS_PER_UNIT, roundToNearestGramUnit } from "@/lib/hairCustomization";

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
  /** When set, quantity is a grams amount (in GRAMS_PER_UNIT steps) rather
   * than a plain unit count — renders a "Grams" stepper instead of the
   * normal "Quantity" one, side by side with Add to Cart just like the
   * regular stepper. Fully controlled by the parent. */
  gramsMode?: boolean;
  grams?: number;
  onGramsChange?: (grams: number) => void;
  maxGrams?: number;
}) {
  const { productId, slug, name, imageUrl, variants, selectedVariantId } = props;
  const cart = useCart();

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId]
  );

  const gramsMode = !!props.gramsMode;
  const grams = props.grams ?? GRAMS_PER_UNIT;
  const [internalQuantity, setQuantity] = useState(1);
  const quantity = gramsMode ? Math.max(1, grams / GRAMS_PER_UNIT) : internalQuantity;

  useEffect(() => {
    if (gramsMode) return;
    props.onQtyChange?.(internalQuantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalQuantity, gramsMode]);

  const stock = selectedVariant?.stock ?? 0;
  const isOutOfStock = stock < 1;
  const MAX_PREORDER_QTY = 10;
  const canDecrease = quantity > 1;
  const canIncrease = isOutOfStock ? quantity < MAX_PREORDER_QTY : quantity < stock;
  const canDecreaseGrams = grams > GRAMS_PER_UNIT;
  const canIncreaseGrams = props.maxGrams == null || grams < props.maxGrams;
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

  const addToCartButton = (
    <button
      type="button"
      onClick={addToCart}
      disabled={quantity < 1}
      className="w-36 rounded-full z-label-1 z-btn--primary disabled:cursor-not-allowed disabled:bg-grey-200 disabled:ring-0 disabled:text-white"
    >
      {isOutOfStock ? "Pre-Order" : "Add to Cart"}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <h4 className="z-title-md">{gramsMode ? "Grams" : "Quantity"}</h4>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          {gramsMode ? (
            <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center gap-3">
              <button
                type="button"
                className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => canDecreaseGrams && props.onGramsChange?.(grams - GRAMS_PER_UNIT)}
                disabled={!canDecreaseGrams}
                aria-label="Decrease grams"
              >
                -
              </button>
              <input
                type="number"
                step={GRAMS_PER_UNIT}
                min={GRAMS_PER_UNIT}
                value={grams}
                onChange={(e) =>
                  props.onGramsChange?.(roundToNearestGramUnit(Number(e.target.value) || GRAMS_PER_UNIT))
                }
                className="w-16 bg-transparent text-center outline-none"
                aria-label="Grams"
              />
              <button
                type="button"
                className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => canIncreaseGrams && props.onGramsChange?.(grams + GRAMS_PER_UNIT)}
                disabled={!canIncreaseGrams}
                aria-label="Increase grams"
              >
                +
              </button>
            </div>
          ) : (
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
          )}

          {isOutOfStock && (
            <div className="text-xs text-[var(--m-muted)]">
              Currently sold out — pre-order takes longer to arrive
            </div>
          )}
        </div>

        {addToCartButton}
      </div>
    </div>
  );
}
