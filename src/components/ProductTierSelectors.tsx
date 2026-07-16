"use client";

import {
  QUALITY_TIERS,
  DENSITY_TIERS,
  computeGramsTotal,
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
  qty,
}: {
  mode: "grams" | "density";
  qualityTierId: QualityTierId;
  onQualityTierChange: (id: QualityTierId) => void;
  densityTierId: DensityTierId;
  onDensityTierChange: (id: DensityTierId) => void;
  qty: number;
}) {
  const { format } = useCurrency();

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
        <p className="m-label text-[var(--m-muted)]">
          Total weight: {computeGramsTotal(qty)}g
        </p>
      )}
    </div>
  );
}
