"use client";

import { STANDARD_LENGTHS_IN, computeLengthSurchargeCents, formatLengthLabel } from "@/lib/hairCustomization";
import { useCurrency } from "@/contexts/currency";

function ChevronIcon() {
  return (
    <svg
      width="10" height="6" viewBox="0 0 10 6" fill="none"
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--m-subtle)]"
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function LengthSelect({
  value,
  onChange,
  className = "",
  lengths,
  priceForLength,
}: {
  value: number;
  onChange: (lengthIn: number) => void;
  className?: string;
  /** Real lengths to offer (e.g. from a product's own variants). Falls back
   * to STANDARD_LENGTHS_IN + the flat surcharge formula when omitted. */
  lengths?: number[];
  /** Absolute price for a given length — shown per option instead of the
   * "+surcharge" hint when provided, since real per-length pricing isn't a
   * flat delta. Required whenever `lengths` is provided. */
  priceForLength?: (lengthIn: number) => number;
}) {
  const { format } = useCurrency();
  const options = lengths ?? STANDARD_LENGTHS_IN;

  return (
    <div className={`relative w-full max-w-xs ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none border border-[var(--m-muted)]/30 bg-transparent py-2.5 pl-4 pr-9 text-sm text-[var(--m-black)] focus:border-[var(--m-gold)] focus:outline-none transition-colors cursor-pointer"
      >
        {options.map((len) => (
          <option key={len} value={len}>
            {formatLengthLabel(len)}
            {priceForLength
              ? ` — ${format(priceForLength(len))}`
              : len > STANDARD_LENGTHS_IN[0]
                ? ` (+${format(computeLengthSurchargeCents(len))})`
                : ""}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}
