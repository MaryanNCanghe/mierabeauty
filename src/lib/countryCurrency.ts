const COUNTRY_CURRENCY: Record<string, string> = {
  // Eurozone
  AD: "eur", AT: "eur", BE: "eur", CY: "eur", DE: "eur",
  EE: "eur", ES: "eur", FI: "eur", FR: "eur", GR: "eur",
  HR: "eur", IE: "eur", IT: "eur", LT: "eur", LU: "eur",
  LV: "eur", MC: "eur", ME: "eur", MT: "eur", NL: "eur",
  PT: "eur", SI: "eur", SK: "eur", SM: "eur", VA: "eur",
  // Europe non-euro
  GB: "gbp", CH: "chf", LI: "chf",
  SE: "sek", NO: "nok", DK: "dkk",
  PL: "pln", CZ: "czk", HU: "huf",
  RO: "ron", BG: "bgn", RS: "rsd",
  IS: "isk", TR: "try", UA: "uah",
  // Americas
  US: "usd", CA: "cad",
  BR: "brl", MX: "mxn", AR: "ars",
  CL: "clp", CO: "cop", PE: "pen",
  // Asia-Pacific
  AU: "aud", NZ: "nzd",
  JP: "jpy", CN: "cny", HK: "hkd",
  SG: "sgd", MY: "myr", TH: "thb",
  KR: "krw", IN: "inr", PK: "pkr",
  BD: "bdt", ID: "idr", PH: "php",
  VN: "vnd", TW: "twd",
  // Middle-East & Africa
  AE: "aed", SA: "sar", IL: "ils",
  EG: "egp", ZA: "zar", NG: "ngn",
  KE: "kes", MA: "mad",
  // Russia
  RU: "rub",
};

const CURRENCY_SYMBOL: Record<string, string> = {
  eur: "€",  gbp: "£",   usd: "$",   cad: "CA$", aud: "A$",
  nzd: "NZ$", chf: "Fr",  sek: "kr",  nok: "kr",  dkk: "kr",
  pln: "zł",  czk: "Kč",  huf: "Ft",  ron: "lei", bgn: "лв",
  rsd: "din", isk: "kr",  try: "₺",   jpy: "¥",   cny: "¥",
  hkd: "HK$", sgd: "S$",  myr: "RM",  thb: "฿",   krw: "₩",
  inr: "₹",   pkr: "₨",   bdt: "৳",   idr: "Rp",  php: "₱",
  vnd: "₫",   twd: "NT$", aed: "د.إ", sar: "﷼",   ils: "₪",
  egp: "E£",  zar: "R",   ngn: "₦",   kes: "KSh", mad: "MAD",
  brl: "R$",  mxn: "$",   ars: "$",   clp: "$",   cop: "$",
  pen: "S/",  uah: "₴",   rub: "₽",
};

export function currencyForCountry(countryCode: string): string {
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? "eur";
}

export function symbolForCurrency(currency: string): string {
  return CURRENCY_SYMBOL[currency.toLowerCase()] ?? currency.toUpperCase();
}

export function formatAmount(cents: number, currency: string): string {
  const symbol = symbolForCurrency(currency);
  // Zero-decimal currencies (JPY, KRW, etc.) — amount is already whole units
  const zeroDecimal = ["jpy", "krw", "clp", "vnd", "bdt", "gnf", "mga", "pyg", "rwf", "ugx", "xaf", "xof"].includes(currency.toLowerCase());
  const amount = zeroDecimal ? cents : cents / 100;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: zeroDecimal ? 0 : 2, maximumFractionDigits: zeroDecimal ? 0 : 2 })}`;
}

// ── Storefront currency switcher ──────────────────────────────────
// All prices are stored in the database as EUR cents. These are the
// only currencies the storefront lets shoppers switch between; rates
// are static (approximate, EUR-based) and should be refreshed
// periodically rather than pulled from a live FX feed.
export const SUPPORTED_CURRENCIES = ["nok", "eur", "usd"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABEL: Record<SupportedCurrency, string> = {
  nok: "NOK",
  eur: "EUR",
  usd: "USD",
};

// Units of currency per 1 EUR (static reference rates).
const EUR_EXCHANGE_RATE: Record<SupportedCurrency, number> = {
  eur: 1,
  nok: 11.7,
  usd: 1.09,
};

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

// Converts a EUR-cents amount (the DB's base unit) into the target
// currency's smallest unit, rounded to the nearest cent.
export function convertEurCents(eurCents: number, currency: SupportedCurrency): number {
  return Math.round(eurCents * EUR_EXCHANGE_RATE[currency]);
}

// Converts + formats a EUR-cents amount in one step.
export function formatEurCents(eurCents: number, currency: SupportedCurrency): string {
  return formatAmount(convertEurCents(eurCents, currency), currency);
}

// Converts a USD amount (e.g. a surcharge quoted in dollars) into EUR-cents,
// using the same static reference rate as everything else in this file.
export function usdToEurCents(usdAmount: number): number {
  return Math.round((usdAmount * 100) / EUR_EXCHANGE_RATE.usd);
}
