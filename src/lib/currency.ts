// Single source for currency formatting across the app. Keep INR + USD;
// add others here if/when they're supported in the Template schema.

export type Currency = "INR" | "USD";

export const CURRENCY_META: Record<Currency, { label: string; symbol: string; locale: string }> = {
  INR: { label: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  USD: { label: "US Dollar", symbol: "$", locale: "en-US" },
};

export function currencySymbol(c: Currency | string | null | undefined): string {
  const key = (c ?? "INR") as Currency;
  return CURRENCY_META[key]?.symbol ?? String(key);
}

export function formatPrice(amount: number | null | undefined, currency: Currency | string | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  const key = (currency ?? "INR") as Currency;
  const meta = CURRENCY_META[key];
  if (!meta) return `${currency ?? ""}${amount.toLocaleString()}`;
  // Use Intl so e.g. INR renders with Indian grouping (₹1,23,456).
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: key,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${meta.symbol}${amount.toLocaleString()}`;
  }
}

// Super-admin-defined fallback FX; override via /krishna/admin/site-settings
// (SiteSetting key: "usd_to_inr"). The converter never pretends to be a live
// rate — it exists so a platform operator can price in both currencies.
const DEFAULT_USD_TO_INR = 84;

export function convertPrice(
  amount: number,
  from: Currency,
  to: Currency,
  rateUsdToInr = DEFAULT_USD_TO_INR,
): number {
  if (from === to) return amount;
  if (from === "USD" && to === "INR") return Math.round(amount * rateUsdToInr);
  if (from === "INR" && to === "USD") return Math.round(amount / rateUsdToInr);
  return amount;
}

// Pick the right stored field on a Template for the viewer's currency.
export function templatePriceFor(
  template: { price: number | null; price_usd: number | null; currency: string | null },
  viewerCurrency: Currency,
  rateUsdToInr?: number,
): { amount: number | null; currency: Currency } {
  const baseCurrency = (template.currency ?? "INR") as Currency;
  if (viewerCurrency === "USD") {
    if (template.price_usd != null) return { amount: template.price_usd, currency: "USD" };
    if (template.price != null)
      return { amount: convertPrice(template.price, baseCurrency, "USD", rateUsdToInr), currency: "USD" };
    return { amount: null, currency: "USD" };
  }
  if (template.price != null) return { amount: template.price, currency: "INR" };
  if (template.price_usd != null)
    return { amount: convertPrice(template.price_usd, "USD", "INR", rateUsdToInr), currency: "INR" };
  return { amount: null, currency: "INR" };
}
