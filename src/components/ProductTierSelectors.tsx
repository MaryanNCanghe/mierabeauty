"use client";

import {
  QUALITY_TIERS,
  DENSITY_TIERS,
  GRAMS_PER_UNIT,
  roundToNearestGramUnit,
  type QualityTierId,
  type DensityTierId,
} from "@/lib/hairCustomization";
import { useCurrency } from "@/contexts/currency";

const PILL_BASE =
  "rounded py-1.5 px-4 text-sm ring-1 transition-colors text-left";
const PILL_ACTIVE = "ring-[var(--m-black)] bg-[var(--m-black)] text-white";
const PILL_INACTIVE = "ring-gray-300 text-[var(--m-black)] hover:ring-[var(--m-black)]";

export default function ProductTierSelectors({
  mode,
  qualityTierId,
  onQualityTierChange,
  densityTierId,
  onDensityTierChange,
  grams,
  onGramsChange,
  maxGrams,
}: {
  mode: "grams" | "density";
  qualityTierId: QualityTierId;
  onQualityTierChange: (id: QualityTierId) => void;
  densityTierId: DensityTierId;
  onDensityTierChange: (id: DensityTierId) => void;
  grams: number;
  onGramsChange: (grams: number) => void;
  maxGrams?: number;
}) {
  const { format } = useCurrency();
  const canDecreaseGrams = grams > GRAMS_PER_UNIT;
  const canIncreaseGrams = maxGrams == null || grams < maxGrams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="z-title-md mb-3">Quality Tier</h4>
        <ul className="flex items-center gap-3 flex-wrap">
          {QUALITY_TIERS.map((tier) => {
            const active = tier.id === qualityTierId;
            return (
              <li key={tier.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onQualityTierChange(tier.id)}
                  className={[PILL_BASE, active ? PILL_ACTIVE : PILL_INACTIVE].join(" ")}
                >
                  {tier.label}
                  {tier.surchargeEurCents > 0 ? ` (+${format(tier.surchargeEurCents)})` : " (Included)"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {mode === "density" && (
        <div>
          <h4 className="z-title-md mb-3">Density</h4>
          <ul className="flex items-center gap-3 flex-wrap">
            {DENSITY_TIERS.map((tier) => {
              const active = tier.id === densityTierId;
              return (
                <li key={tier.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onDensityTierChange(tier.id)}
                    className={[PILL_BASE, active ? PILL_ACTIVE : PILL_INACTIVE].join(" ")}
                  >
                    {tier.percentLabel} ({tier.label})
                    {tier.surchargeEurCents > 0 ? ` +${format(tier.surchargeEurCents)}` : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {mode === "grams" && (
        <div>
          <h4 className="z-title-md mb-3">Grams</h4>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center gap-3">
              <button
                type="button"
                className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => canDecreaseGrams && onGramsChange(grams - GRAMS_PER_UNIT)}
                disabled={!canDecreaseGrams}
                aria-label="Decrease grams"
              >
                −
              </button>
              <input
                type="number"
                step={GRAMS_PER_UNIT}
                min={GRAMS_PER_UNIT}
                value={grams}
                onChange={(e) => onGramsChange(roundToNearestGramUnit(Number(e.target.value) || GRAMS_PER_UNIT))}
                className="w-16 bg-transparent text-center outline-none"
                aria-label="Grams"
              />
              <button
                type="button"
                className="cursor-pointer text-xl disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => canIncreaseGrams && onGramsChange(grams + GRAMS_PER_UNIT)}
                disabled={!canIncreaseGrams}
                aria-label="Increase grams"
              >
                +
              </button>
            </div>
            <span className="m-label text-[var(--m-muted)]">grams</span>
          </div>
        </div>
      )}
    </div>
  );
}
