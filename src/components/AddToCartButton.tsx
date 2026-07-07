
// src/components/AddToCartButton.tsx
"use client";
import { useCart } from "@/contexts/cart";

export function AddToCartButton(props: {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl?: string;
}) {
  const cart = useCart();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        cart.addItem(
          {
            productId: props.productId,
            slug: props.slug,
            name: props.name,
            priceCents: props.priceCents,
            imageUrl: props.imageUrl,
          },
          1
        );
      }}
      className="rounded-2xl ring-1 ring-lama text-lama w-max py-2 px-4 text-xs hover:bg-lama hover:text-white"
    >
      Add to Cart
    </button>
  );
}
