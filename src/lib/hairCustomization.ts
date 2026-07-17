import { usdToEurCents } from "@/lib/countryCurrency";

// ── Standard colors (7) ─────────────────────────────────────────────
export type HairColorOption = { name: string; swatchClassName: string };
export const STANDARD_HAIR_COLORS: HairColorOption[] = [
  { name: "Natural Black", swatchClassName: "bg-black" },
  { name: "Dark Brown", swatchClassName: "bg-[#3B2A20]" },
  { name: "Natural Brown", swatchClassName: "bg-[#5A3E2B]" },
  { name: "Caramel Brown", swatchClassName: "bg-[#8A5A34]" },
  { name: "Chestnut Brown", swatchClassName: "bg-[#6B3E26]" },
  { name: "Blonde", swatchClassName: "bg-[#D9B36C]" }, // display alias "Golden Blonde"
  { name: "Platinum Blonde", swatchClassName: "bg-[#E8DCC8]" },
];

export function colorNameToSwatchClassName(colorName: string): string | undefined {
  return STANDARD_HAIR_COLORS.find(
    (c) => c.name.toLowerCase() === colorName.trim().toLowerCase()
  )?.swatchClassName;
}

// ── Standard lengths (even inches 16–32, one row, matches DB's existing convention) ──
export const STANDARD_LENGTHS_IN: number[] = Array.from({ length: 9 }, (_, i) => 16 + i * 2);

export function formatLengthLabel(inches: number): string {
  return `${inches}" / ${Math.round(inches * 2.54)}cm`;
}

// ── Length pricing — flat, formulaic surcharge shared by every surface ──
// Every standard length is always selectable (not gated by real per-length
// stock); price scales by a flat amount per 2" step above the shortest
// standard length, regardless of product or category.
export const LENGTH_STEP_IN = 2;
export const LENGTH_STEP_SURCHARGE_EUR_CENTS = 1500; // €15 per 2" step (given directly in EUR, flat across the whole site)

export function computeLengthSurchargeCents(
  lengthIn: number,
  baseLengthIn: number = STANDARD_LENGTHS_IN[0]
): number {
  const steps = Math.round((lengthIn - baseLengthIn) / LENGTH_STEP_IN);
  return Math.max(0, steps) * LENGTH_STEP_SURCHARGE_EUR_CENTS;
}

// ── Quality tier — new pricing-modifier dimension, always fully selectable ──
export type QualityTierId = "standard" | "super_double_drawn" | "super_premium_double_drawn";
export const QUALITY_TIERS: { id: QualityTierId; label: string; surchargeEurCents: number }[] = [
  { id: "standard", label: "Standard / Double Drawn", surchargeEurCents: 0 },
  { id: "super_double_drawn", label: "Super Double Drawn", surchargeEurCents: usdToEurCents(20) },
  { id: "super_premium_double_drawn", label: "Super Premium Double Drawn", surchargeEurCents: usdToEurCents(35) },
];

// ── Density tier — new pricing-modifier dimension, always fully selectable ──
export type DensityTierId = "130" | "150" | "180" | "200";
export const DENSITY_TIERS: { id: DensityTierId; label: string; percentLabel: string; surchargeEurCents: number }[] = [
  { id: "130", label: "Light-Medium", percentLabel: "130%", surchargeEurCents: 0 },
  { id: "150", label: "Medium", percentLabel: "150%", surchargeEurCents: usdToEurCents(15) },
  { id: "180", label: "Heavy", percentLabel: "180%", surchargeEurCents: usdToEurCents(35) },
  { id: "200", label: "Extra Heavy/Full", percentLabel: "200%+", surchargeEurCents: usdToEurCents(60) },
];

// ── Grams — the actual unit of purchase for grams-mode products ────
// The shopper picks a gram amount directly (in clean 100g steps); price
// scales linearly with it, e.g. 200g = double the 100g price.
export const GRAMS_PER_UNIT = 100;

export function roundToNearestGramUnit(grams: number): number {
  return Math.max(GRAMS_PER_UNIT, Math.round(grams / GRAMS_PER_UNIT) * GRAMS_PER_UNIT);
}

// Cart lines store `qty` as the number of GRAMS_PER_UNIT units purchased
// (for grams-mode items, qty === grams / GRAMS_PER_UNIT) — this reconstructs
// the gram total for display in the cart/checkout.
export function computeGramsTotal(qty: number): number {
  return Math.max(0, qty) * GRAMS_PER_UNIT;
}

// ── Category → customizer mode ──────────────────────────────────────
export type CustomizerMode = "grams" | "density" | "none";
const DENSITY_CATEGORY_SLUGS = new Set(["closures-frontals", "full-lace-wigs", "lace-front-wigs", "ponytails"]);
const EXCLUDED_CATEGORY_SLUGS = new Set(["hair-growth"]);

export function customizerModeForCategorySlug(categorySlug: string | null | undefined): CustomizerMode {
  if (!categorySlug || EXCLUDED_CATEGORY_SLUGS.has(categorySlug)) return "none";
  return DENSITY_CATEGORY_SLUGS.has(categorySlug) ? "density" : "grams";
}

// ── Price computation ───────────────────────────────────────────────
// Returns the price for ONE GRAMS_PER_UNIT unit (e.g. one 100g bundle).
// Grams scaling is deliberately NOT applied here — it's handled by the
// cart's own qty mechanism (qty = grams / GRAMS_PER_UNIT), exactly like
// any other quantity. Baking a grams multiplier in here too would double
// it, since cart subtotal is already `priceCents * qty`.
export function computeCustomizedUnitPriceCents(args: {
  baseVariantPriceCents: number;
  lengthSurchargeCents?: number;
  qualityTierId?: QualityTierId | null;
  densityTierId?: DensityTierId | null;
}): number {
  const quality = QUALITY_TIERS.find((t) => t.id === args.qualityTierId) ?? QUALITY_TIERS[0];
  const density = args.densityTierId ? DENSITY_TIERS.find((t) => t.id === args.densityTierId) : undefined;
  return (
    args.baseVariantPriceCents +
    (args.lengthSurchargeCents ?? 0) +
    quality.surchargeEurCents +
    (density?.surchargeEurCents ?? 0)
  );
}

// ── /custom builder: product types + starting base prices ──────────
// No real variant exists to source a price from for a from-scratch build —
// these are editable starting estimates derived from this store's current
// real category averages, not a fixed business rule.
export type CustomProductTypeId =
  | "bundle"
  | "clip-in"
  | "ponytail"
  | "closure"
  | "frontal"
  | "wig-lace-front"
  | "wig-full-lace";

export const CUSTOM_PRODUCT_TYPES: { id: CustomProductTypeId; label: string; mode: CustomizerMode }[] = [
  { id: "bundle", label: "Bundle / Weft", mode: "grams" },
  { id: "clip-in", label: "Clip-Ins", mode: "grams" },
  { id: "ponytail", label: "Ponytail", mode: "density" },
  { id: "closure", label: "Closure", mode: "density" },
  { id: "frontal", label: "Frontal", mode: "density" },
  { id: "wig-lace-front", label: "Lace Front Wig", mode: "density" },
  { id: "wig-full-lace", label: "Full Lace Wig", mode: "density" },
];

export const CUSTOM_BASE_PRICE_EUR_CENTS: Record<CustomProductTypeId, number> = {
  bundle: 15500, // ≈ avg of real Bundles & Weaves / Virgin Human Hair products
  "clip-in": 11500, // ≈ real Clip-In Volumizer Set price
  ponytail: 8500, // ≈ real Drawstring Ponytail price
  closure: 9500, // ≈ real 5x5 HD Lace Closure price
  frontal: 14000, // no real frontal product yet; estimated above closure
  "wig-lace-front": 20000, // ≈ avg of real Lace Front Wig products
  "wig-full-lace": 25500, // ≈ avg of real Full Lace Wig products
};

export type TextureId = "straight" | "body_wave" | "deep_wave" | "curly";
export const TEXTURES: { id: TextureId; label: string }[] = [
  { id: "straight", label: "Straight" },
  { id: "body_wave", label: "Body Wave" },
  { id: "deep_wave", label: "Deep Wave" },
  { id: "curly", label: "Curly" },
];

// ── Cart/order attribute display ────────────────────────────────────
// Internal-only flags (preorder, custom, gramsMode) are excluded — they get
// their own dedicated UI treatment instead of appearing in this generic line.
const CART_ATTRIBUTE_DISPLAY_ORDER = ["color", "size", "texture", "qualityTier", "density", "productType"];

export function formatCartAttributesLine(
  attrs?: Record<string, string | number | undefined> | null
): string {
  if (!attrs) return "";
  return CART_ATTRIBUTE_DISPLAY_ORDER.map((k) => attrs[k])
    .filter((v): v is string | number => v !== undefined && v !== null && v !== "")
    .join(" / ");
}
