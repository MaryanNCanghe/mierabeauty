"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart";

type CartItem = {
  productId: string;
  variantId?: string | null;
  name: string;
  imageUrl?: string | null;
  priceCents: number;
  qty: number;
  attributes?: {
    color?: string;
    size?: string;
  };
};

export default function CartPage() {
  const {
    items,
    removeItem,
    subtotalCents,
    clear,
    updateQty,
    addItem,
  } = useCart() as unknown as {
    items: CartItem[];
    removeItem: (productId: string, variantId?: string | null) => void;
    subtotalCents: number;
    clear: () => void;
    updateQty?: (
      productId: string,
      variantId: string | null | undefined,
      qty: number
    ) => void;
    addItem?: (payload: {
      productId: string;
      variantId?: string | null;
      name: string;
      imageUrl?: string | null;
      priceCents: number;
      qty: number;
      attributes?: CartItem["attributes"];
    }) => void;
  };

  const hasItems = items.length > 0;

  const handleQtyChange = (item: CartItem, nextQty: number) => {
    if (nextQty < 1) {
      removeItem(item.productId, item.variantId ?? null);
      return;
    }

    if (typeof updateQty === "function") {
      updateQty(item.productId, item.variantId ?? null, nextQty);
      return;
    }

    if (typeof addItem === "function") {
      removeItem(item.productId, item.variantId ?? null);
      addItem({
        productId: item.productId,
        variantId: item.variantId ?? null,
        name: item.name,
        imageUrl: item.imageUrl,
        priceCents: item.priceCents,
        qty: nextQty,
        attributes: item.attributes,
      });
      return;
    }

    console.warn("Nem updateQty nem addItem estão disponíveis no contexto do carrinho.");
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="z-title-md mb-6 mt-20">Your Cart</h1>

      {!hasItems ? (
        <div className="rounded-md border border-gray-200 p-8 text-center bg-white">
          <p className="z-label mb-4">Your cart is empty.</p>
          <Link href="/list" className="z-btn z-btn--secondary">
           Back to Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LIST Items */}
          <section className="lg:col-span-2 space-y-6">
            {items.map((it) => (
              <div
                key={`${it.productId}-${it.variantId ?? "base"}`}
                className="flex gap-4 border-b border-gray-100 pb-6"
              >
                <div className="relative w-[100px] h-[130px] shrink-0">
                  <Image
                    src={it.imageUrl || "/product.png"}
                    alt={it.name}
                    fill
                    sizes="130px"
                    className="object-cover rounded-md"
                  />
                </div>

                <div className="flex flex-col justify-between w-full">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="z-title-sm leading-tight">{it.name}</h3>
                      <div className="px-2 py-1 bg-gray-50 rounded-sm z-label-1">
                        €{(it.priceCents / 100).toFixed(2)}
                      </div>
                    </div>

                    {it.attributes &&
                      (it.attributes.color || it.attributes.size) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {[it.attributes.color, it.attributes.size]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>
                      )}

                    <div className="text-xs text-green-600 mt-1">Available</div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        onClick={() => handleQtyChange(it, it.qty - 1)}
                        className="z-btn z-btn--ghost"
                      >
                        −
                      </button>
                      <span className="z-label">Qty. {it.qty}</span>
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        onClick={() => handleQtyChange(it, it.qty + 1)}
                        className="z-btn z-btn--ghost"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(it.productId, it.variantId ?? null)
                      }
                      className="z-label-1 text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <button
                onClick={clear}
                className="z-btn z-btn--primary text-gray-700"
              >
               Clear Cart
              </button>
              <Link href="/list" className="z-btn z-btn--secondary">
                Keep Shopping
              </Link>
            </div>
          </section>

          {/*   Summary */}
          <aside className="lg:col-span-1">
            <div className="rounded-md border border-gray-200 p-4 sticky top-6 bg-white">
              <h2 className="z-title-sm mb-4 z-label-1 border-b border-black px-4 py-2 inline-block">Summary</h2>

              <div className="z-title-md flex items-center justify-between z-label mb-2">
                <span>Subtotal</span>
                <span>€{(subtotalCents / 100).toFixed(2)}</span>
              </div>

              <p className="z-label text-gray-500 mb-4">
                SHIPPING AND TAXES CALCULATED AT CHECKOUT
              </p>

              <Link
                href="/checkout"
                className="z-btn z-btn--secondary-1 w-full inline-flex justify-center"
              >
                Checkout
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
