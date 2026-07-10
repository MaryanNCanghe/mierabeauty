"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  convertEurCents,
  formatEurCents,
  isSupportedCurrency,
  type SupportedCurrency,
} from "@/lib/countryCurrency";

type CurrencyState = {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  /** Converts a EUR-cents amount (DB base unit) to the active currency's cents. */
  convert: (eurCents: number) => number;
  /** Converts + formats a EUR-cents amount for display, e.g. "kr 1,884.00". */
  format: (eurCents: number) => string;
};

const CurrencyContext = createContext<CurrencyState | null>(null);
const STORAGE_KEY = "miera-currency";
const DEFAULT_CURRENCY: SupportedCurrency = "nok";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isSupportedCurrency(saved)) setCurrencyState(saved);
    } catch {}
  }, []);

  const setCurrency = (next: SupportedCurrency) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const value = useMemo<CurrencyState>(
    () => ({
      currency,
      setCurrency,
      convert: (eurCents: number) => convertEurCents(eurCents, currency),
      format: (eurCents: number) => formatEurCents(eurCents, currency),
    }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a <CurrencyProvider>");
  return ctx;
}
