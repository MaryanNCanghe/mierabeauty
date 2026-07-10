"use client";

import { useCurrency } from "@/contexts/currency";
import { CURRENCY_LABEL, SUPPORTED_CURRENCIES, isSupportedCurrency } from "@/lib/countryCurrency";

export default function CurrencySwitcher({ light = false }: { light?: boolean }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      aria-label="Currency"
      value={currency}
      onChange={(e) => {
        const next = e.target.value;
        if (isSupportedCurrency(next)) setCurrency(next);
      }}
      className={`bg-transparent m-label text-xs tracking-widest cursor-pointer focus:outline-none transition-colors duration-300 ${
        light ? "text-white" : "text-[var(--m-black)]"
      }`}
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c} className="text-[var(--m-black)]">
          {CURRENCY_LABEL[c]}
        </option>
      ))}
    </select>
  );
}
