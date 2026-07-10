"use client";

import { useCurrency } from "@/contexts/currency";

// Renders a EUR-cents amount (the DB's base unit) in the shopper's
// currently selected currency. Needed anywhere a price is shown from
// a server component, since currency conversion depends on client state.
export default function PriceTag({
  eurCents,
  className,
}: {
  eurCents?: number | null;
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={className}>{format(eurCents ?? 0)}</span>;
}
