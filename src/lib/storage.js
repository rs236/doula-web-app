/* Browser persistence for the MVP.

   Everything lives in this browser's localStorage under one key.
   No account, no server, no sync between devices.
   Clearing site data clears the practice. */

export const KEY = "msc-doula-mvp-v1";

export function isAvailable() {
  try {
    const probe = "__msc_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** Fields added after the first release. Old saves won't have them —
    default each to an empty list rather than losing older data. */
function hydrate(db) {
  return {
    ...db,
    customForms: Array.isArray(db.customForms) ? db.customForms : [],
    currency: db.currency || "USD",
  };
}

export function loadDb() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.clients)) return null;
    return hydrate(parsed);
  } catch {
    return null;
  }
}

export function saveDb(db) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
    return true;
  } catch {
    return false;
  }
}

export function clearDb() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
