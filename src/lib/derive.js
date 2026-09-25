import { ga, today, daysBetween, gaLabel } from "./date.js";
import { formatMoney } from "./currency.js";

/** Short preference line used on the backup-doula handoff sheet. */
export function prefSummary(db, clientId) {
  const a = db.assigned.find(
    (x) => x.clientId === clientId && x.formId === "birthprefs" && x.completedOn
  );
  if (!a) return "";
  const A = a.answers;
  return [A.pain, Array.isArray(A.comfort) ? A.comfort.join(", ") : "", A.feeding]
    .filter(Boolean)
    .join(" · ");
}

export const renderVal = (v) => {
  if (v === undefined || v === "" || v === null) return "—";
  if (Array.isArray(v)) return v.join(" · ");
  if (v === true) return "Agreed";
  return String(v);
};

/** Everything that needs the doula's attention today. */
export function buildAlerts(db) {
  const alerts = [];
  db.clients.forEach((c) => {
    const g = ga(c.edd);
    const mine = db.assigned.filter((a) => a.clientId === c.id);
    const outstanding = mine.filter((a) => !a.completedOn);

    if (g.w >= 34 && outstanding.length && c.status !== "Postpartum" && c.status !== "Closed")
      alerts.push({
        tone: "warn",
        clientId: c.id,
        text: `${c.name} — ${outstanding.length} form${outstanding.length > 1 ? "s" : ""} still open at ${gaLabel(c.edd)}`,
      });

    db.payments
      .filter((p) => p.clientId === c.id && !p.paidOn && g.w >= p.dueWeek)
      .forEach((p) =>
        alerts.push({
          tone: "warn",
          clientId: c.id,
          text: `${c.name} — ${p.label} overdue (${formatMoney(p.amount, db.currency || "USD")})`,
        })
      );

    if (g.w >= 38 && c.status === "Booked")
      alerts.push({
        tone: "act",
        clientId: c.id,
        text: `${c.name} reached ${gaLabel(c.edd)} — move to on-call and confirm backup`,
      });

    if (c.status === "On-call" && !c.backupId)
      alerts.push({
        tone: "warn",
        clientId: c.id,
        text: `${c.name} is on-call with no backup doula assigned`,
      });

    if (c.status === "Postpartum") {
      const last = db.checkins
        .filter((k) => k.clientId === c.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      if (!last || daysBetween(last.date, today()) > 7)
        alerts.push({ tone: "act", clientId: c.id, text: `${c.name} — wellness check-in due` });
      if (last && last.flagged)
        alerts.push({
          tone: "flag",
          clientId: c.id,
          text: `${c.name} — last check-in flagged for follow-up`,
        });
    }
  });
  return alerts;
}
