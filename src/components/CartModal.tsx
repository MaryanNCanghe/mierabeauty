"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart";
import { useCurrency } from "@/contexts/currency";
import { formatCartAttributesLine, computeGramsTotal } from "@/lib/hairCustomization";

export default function CartModal() {
  const { items, removeItem, subtotalCents, clear } = useCart();
  const { format } = useCurrency();

  return (
    <div className="w-max absolute p-4 rounded-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-white top-12 right-0 flex flex-col gap-4 z-20">
      <h2 className="z-title-md">Shopping Cart</h2>

      {/* ITEMS */}
      <div className="flex flex-col gap-8">
        {items.map((it) => (
          <div
            key={`${it.productId}-${it.variantId ?? "base"}`}
            className="flex gap-4"
          >
            <div className="relative w-[72px] h-[96px]">
              <Image
                src={it.imageUrl || "/product.png"}
                alt={it.name}
                fill
                sizes="96px"
                className="object-cover rounded-md"
              />
            </div>

            <div className="flex flex-col justify-between w-full">
              <div>
                <div className="flex items-center justify-between gap-8">
                  <h3 className="font-semibold">{it.name}</h3>
                  <div className="p-1 bg-gray-50 rounded-sm">
                    {format(it.priceCents)}
                  </div>
                </div>

                {it.attributes && formatCartAttributesLine(it.attributes) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {formatCartAttributesLine(it.attributes)}
                  </div>
                )}

                {it.attributes?.gramsMode && (
                  <div className="text-xs text-gray-500 mt-1">
                    {computeGramsTotal(it.qty)}g total
                  </div>
                )}

                {it.attributes?.preorder ? (
                  <div className="text-sm text-[var(--m-gold)]">
                    Pre-Order — ships later
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Available</div>
                )}
              </div>

              <div className="flex justify-between text-sm pt-6">
                <span className="text-gray-500">Qty. {it.qty}</span>
                <button
                  onClick={() =>
                    removeItem(it.productId, it.variantId)
                  }
                  className="text-red-500 z-label-1"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div>
        <div className="flex items-center justify-between z-title-sm">
          <span>Subtotal</span>
          <span>{format(subtotalCents)}</span>
        </div>

        <p className="z-label mt-2 mb-4">
          Shipping and taxes calculated at checkout.
        </p>

        <div className="flex justify-between text-sm">
          <Link href="/cart" className="z-btn z-btn--secondary z-btn--secondary:hover">
            View Cart
          </Link>

          <button onClick={clear} className="text-grey-600 hover:underline">
            Clear
          </button>

          <Link href="/checkout" className=" z-btn z-btn--secondary z-btn--secondary:hover">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
