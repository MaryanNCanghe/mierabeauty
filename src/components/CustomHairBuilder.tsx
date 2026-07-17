"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart";
import { useCurrency } from "@/contexts/currency";
import ColorSwatchButton from "@/components/ColorSwatchButton";
import LengthSelect from "@/components/LengthSelect";
import ProductTierSelectors from "@/components/ProductTierSelectors";
import {
  STANDARD_HAIR_COLORS,
  STANDARD_LENGTHS_IN,
  CUSTOM_PRODUCT_TYPES,
  CUSTOM_BASE_PRICE_EUR_CENTS,
  TEXTURES,
  QUALITY_TIERS,
  DENSITY_TIERS,
  GRAMS_PER_UNIT,
  computeGramsTotal,
  computeCustomizedUnitPriceCents,
  computeLengthSurchargeCents,
  formatLengthLabel,
  type CustomProductTypeId,
  type TextureId,
  type QualityTierId,
  type DensityTierId,
} from "@/lib/hairCustomization";

const PILL_BASE = "rounded py-1.5 px-4 text-sm ring-1 transition-colors flex items-center gap-2";
const PILL_ACTIVE = "ring-[var(--m-black)] bg-[var(--m-black)] text-white";
const PILL_INACTIVE = "ring-gray-300 text-[var(--m-black)] hover:ring-[var(--m-black)]";

function TextureIcon({ id }: { id: TextureId }) {
  const paths: Record<TextureId, string> = {
    straight: "M2 8 H22",
    body_wave: "M2 8 Q7 4 12 8 T22 8",
    deep_wave: "M2 8 Q6 2 10 8 T18 8 T22 8",
    curly: "M2 8 Q4 2 6 8 T10 8 T14 8 T18 8 T22 8",
  };
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
      <path d={paths[id]} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ProductTypeIcon({ id }: { id: CustomProductTypeId }) {
  // Simple, consistent line-art glyphs — not literal photography, just visually distinct.
  const icons: Record<CustomProductTypeId, JSX.Element> = {
    bundle: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 4 H16 M6 4 V16 M10 4 V16 M14 4 V16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    "clip-in": (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="5" y="3" width="10" height="6" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 9 V17 M13 9 V17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    ponytail: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 9 Q6 13 8 17 M10 9 Q14 13 12 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    closure: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 10 H16 M8 6 V14 M12 6 V14" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    frontal: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 12 Q10 4 17 12" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 12 H17" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    "wig-lace-front": (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 17 Q4 4 10 4 Q16 4 16 17" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 9 H16" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    "wig-full-lace": (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 17 Q4 4 10 4 Q16 4 16 17" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 9 H16 M6 4 V17 M14 4 V17" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  };
  return icons[id];
}

export default function CustomHairBuilder({ placeholderProductId }: { placeholderProductId: number }) {
  const cart = useCart();
  const router = useRouter();
  const { format } = useCurrency();

  const [productTypeId, setProductTypeId] = useState<CustomProductTypeId>("bundle");
  const [textureId, setTextureId] = useState<TextureId>("straight");
  const [colorName, setColorName] = useState<string>(STANDARD_HAIR_COLORS[0].name);
  const [lengthIn, setLengthIn] = useState<number>(STANDARD_LENGTHS_IN[0]);
  const [qualityTierId, setQualityTierId] = useState<QualityTierId>("standard");
  const [densityTierId, setDensityTierId] = useState<DensityTierId>("130");
  const [qty, setQty] = useState(1);
  const [grams, setGrams] = useState(GRAMS_PER_UNIT);

  const productType = CUSTOM_PRODUCT_TYPES.find((t) => t.id === productTypeId)!;
  const mode = productType.mode === "density" ? "density" : "grams";
  // For grams-mode product types, grams IS the quantity (grams / 100 units);
  // density-mode types keep the plain 1-10 quantity stepper.
  const effectiveQty = mode === "grams" ? grams / GRAMS_PER_UNIT : qty;

  const basePriceCents = CUSTOM_BASE_PRICE_EUR_CENTS[productTypeId];

  // Per-GRAMS_PER_UNIT-unit price — grams scaling happens via effectiveQty
  // (mirrors the cart's own qty × priceCents math), never baked in twice.
  const unitPriceCents = useMemo(
    () =>
      computeCustomizedUnitPriceCents({
        baseVariantPriceCents: basePriceCents,
        lengthSurchargeCents: computeLengthSurchargeCents(lengthIn),
        qualityTierId,
        densityTierId: mode === "density" ? densityTierId : null,
      }),
    [basePriceCents, lengthIn, qualityTierId, densityTierId, mode]
  );

  const totalPriceCents = unitPriceCents * effectiveQty;
  const qualityTier = QUALITY_TIERS.find((t) => t.id === qualityTierId)!;
  const densityTier = DENSITY_TIERS.find((t) => t.id === densityTierId)!;
  const texture = TEXTURES.find((t) => t.id === textureId)!;

  const canAddToCart = placeholderProductId > 0;

  function handleAddToCart() {
    if (!canAddToCart) return;
    cart.addItem(
      {
        productId: placeholderProductId,
        slug: "custom-hair-build",
        name: `Custom ${productType.label} — ${colorName}, ${formatLengthLabel(lengthIn)}`,
        priceCents: unitPriceCents,
        attributes: {
          custom: "true",
          productType: productType.label,
          texture: texture.label,
          color: colorName,
          size: String(lengthIn),
          qualityTier: qualityTier.label,
          ...(mode === "density" ? { density: densityTier.percentLabel } : { gramsMode: "true" }),
        },
      },
      effectiveQty
    );
    router.push("/cart");
  }

  return (
    <div className="pt-20 md:pt-24 pb-16 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
      {/* Form column */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div>
          <span className="m-label text-[var(--m-gold)]">Custom</span>
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-light leading-tight text-[var(--m-black)] mt-2">
            Build Your Own
          </h1>
          <p className="text-[var(--m-muted)] text-sm font-light leading-relaxed mt-3">
            Choose every detail — texture, color, product type, and length — and we&apos;ll craft it to order.
          </p>
        </div>

        <div className="h-px bg-[var(--m-gold)]/20" />

        {/* Product Type */}
        <div>
          <h4 className="z-title-md mb-3">Product Type</h4>
          <ul className="flex flex-wrap gap-3">
            {CUSTOM_PRODUCT_TYPES.map((t) => {
              const active = t.id === productTypeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setProductTypeId(t.id)}
                    className={[PILL_BASE, active ? PILL_ACTIVE : PILL_INACTIVE].join(" ")}
                  >
                    <ProductTypeIcon id={t.id} />
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Texture */}
        <div>
          <h4 className="z-title-md mb-3">Texture</h4>
          <ul className="flex flex-wrap gap-3">
            {TEXTURES.map((t) => {
              const active = t.id === textureId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTextureId(t.id)}
                    className={[PILL_BASE, active ? PILL_ACTIVE : PILL_INACTIVE].join(" ")}
                  >
                    <TextureIcon id={t.id} />
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Color */}
        <div>
          <h4 className="z-title-md mb-3">Color</h4>
          <ul className="flex items-center gap-3 flex-wrap">
            {STANDARD_HAIR_COLORS.map((c) => (
              <li key={c.name}>
                <ColorSwatchButton
                  name={c.name}
                  active={colorName === c.name}
                  onClick={() => setColorName(c.name)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Length */}
        <div>
          <h4 className="z-title-md mb-3">Length</h4>
          <LengthSelect value={lengthIn} onChange={setLengthIn} />
        </div>

        {/* Quality tier + density/grams */}
        <ProductTierSelectors
          mode={mode}
          qualityTierId={qualityTierId}
          onQualityTierChange={setQualityTierId}
          densityTierId={densityTierId}
          onDensityTierChange={setDensityTierId}
          grams={grams}
          onGramsChange={setGrams}
        />

        {/* Quantity — only for density-mode types; grams-mode types use the
            grams input above as their quantity instead. */}
        {mode === "density" && (
          <div>
            <h4 className="z-title-md mb-3">Quantity</h4>
            <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
              <button
                type="button"
                className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => qty > 1 && setQty((q) => q - 1)}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                -
              </button>
              {qty}
              <button
                type="button"
                className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => qty < 10 && setQty((q) => q + 1)}
                disabled={qty >= 10}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky price summary */}
      <div className="w-full lg:w-1/3">
        <div className="lg:sticky lg:top-28 lg:self-start rounded-md border border-gray-200 bg-white p-6 flex flex-col gap-3">
          <h2 className="z-title-md mb-2">Summary</h2>

          <div className="flex justify-between z-label text-gray-600">
            <span>Base price</span>
            <span>{format(basePriceCents)}</span>
          </div>
          <div className="flex justify-between z-label text-gray-600">
            <span>Length ({formatLengthLabel(lengthIn)})</span>
            <span>
              {computeLengthSurchargeCents(lengthIn) > 0
                ? `+${format(computeLengthSurchargeCents(lengthIn))}`
                : "Included"}
            </span>
          </div>
          <div className="flex justify-between z-label text-gray-600">
            <span>Quality tier</span>
            <span>{qualityTier.surchargeEurCents > 0 ? `+${format(qualityTier.surchargeEurCents)}` : "Included"}</span>
          </div>
          {mode === "density" && (
            <div className="flex justify-between z-label text-gray-600">
              <span>Density ({densityTier.percentLabel})</span>
              <span>{densityTier.surchargeEurCents > 0 ? `+${format(densityTier.surchargeEurCents)}` : "Included"}</span>
            </div>
          )}

          <div className="h-px bg-[var(--m-gold)]/20 my-1" />

          <div className="flex justify-between z-label-1">
            <span>Unit price {mode === "grams" ? `(per ${GRAMS_PER_UNIT}g)` : ""}</span>
            <span>{format(unitPriceCents)}</span>
          </div>
          <div className="flex justify-between z-label text-gray-600">
            <span>Quantity</span>
            <span>× {effectiveQty}</span>
          </div>

          {mode === "grams" && (
            <div className="flex justify-between z-label text-gray-600">
              <span>Total weight</span>
              <span>{computeGramsTotal(effectiveQty)}g</span>
            </div>
          )}

          <div className="h-px bg-[var(--m-gold)]/20 my-1" />

          <div className="flex justify-between font-display text-lg text-[var(--m-black)]">
            <span>Total</span>
            <span>{format(totalPriceCents)}</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="z-btn z-btn--primary w-full justify-center mt-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Cart
          </button>
          {!canAddToCart && (
            <p className="text-xs text-red-600">Custom builds are temporarily unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
