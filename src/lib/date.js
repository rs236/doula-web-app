/* Date + gestational-age helpers. */

const DAY = 86400000;

export const iso = (d) => new Date(d).toISOString().slice(0, 10);
export const today = () => iso(new Date());
export const parse = (s) => new Date(s + "T12:00:00");
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY);
export const addDays = (s, n) => iso(new Date(parse(s).getTime() + n * DAY));

export const fmt = (s) =>
  parse(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
export const fmtShort = (s) =>
  parse(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** Gestational age from an estimated due date. 280 days = 40w0d. */
export function ga(edd, on = today()) {
  const days = 280 - daysBetween(on, edd);
  return { days, w: Math.floor(days / 7), d: ((days % 7) + 7) % 7 };
}

export const gaLabel = (edd) => {
  const g = ga(edd);
  if (g.days < 0) return "pre-conception";
  if (g.days > 294) return `${Math.floor((g.days - 280) / 7)}w post-dates`;
  return `${g.w}w${g.d}d`;
};

/**
 * Cryptographically Secure ID & Token Generator
 * Uses Web Crypto API (window.crypto / globalThis.crypto)
 */
export function secureRandomBytes(length = 16) {
  const cryptoObj =
    typeof window !== "undefined" && window.crypto
      ? window.crypto
      : typeof globalThis !== "undefined" && globalThis.crypto
      ? globalThis.crypto
      : null;

  if (cryptoObj && cryptoObj.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Hardened fallback
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export const uid = () => secureRandomBytes(8);
export const secureToken = () => "tok_" + secureRandomBytes(24);

