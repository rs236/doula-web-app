/**
 * Multi-Currency System for Doula SaaS Workspace
 * Defaults to USD ($) and allows instant switching to EUR, GBP, CAD, AUD, INR.
 */

export const CURRENCIES = [
  {
    code: "USD",
    symbol: "$",
    label: "USD ($) — US Dollar",
    locale: "en-US",
    name: "US Dollar",
    distUnit: "mi",
    rateLabel: "$ per mile",
  },
  {
    code: "EUR",
    symbol: "€",
    label: "EUR (€) — Euro",
    locale: "de-DE",
    name: "Euro",
    distUnit: "km",
    rateLabel: "€ per km",
  },
  {
    code: "GBP",
    symbol: "£",
    label: "GBP (£) — British Pound",
    locale: "en-GB",
    name: "British Pound",
    distUnit: "mi",
    rateLabel: "£ per mile",
  },
  {
    code: "CAD",
    symbol: "CA$",
    label: "CAD ($) — Canadian Dollar",
    locale: "en-CA",
    name: "Canadian Dollar",
    distUnit: "km",
    rateLabel: "$ per km",
  },
  {
    code: "AUD",
    symbol: "A$",
    label: "AUD ($) — Australian Dollar",
    locale: "en-AU",
    name: "Australian Dollar",
    distUnit: "km",
    rateLabel: "$ per km",
  },
  {
    code: "INR",
    symbol: "₹",
    label: "INR (₹) — Indian Rupee",
    locale: "en-IN",
    name: "Indian Rupee",
    distUnit: "km",
    rateLabel: "₹ per km",
  },
];

export function getCurrency(code = "USD") {
  const normalized = (code || "USD").toUpperCase();
  return CURRENCIES.find((c) => c.code === normalized) || CURRENCIES[0];
}

export function currencySymbol(code = "USD") {
  return getCurrency(code).symbol;
}

export function formatMoney(amount = 0, code = "USD") {
  const curr = getCurrency(code);
  const num = Number(amount) || 0;
  return `${curr.symbol}${num.toLocaleString(curr.locale)}`;
}
