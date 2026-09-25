import { useState } from "react";
import { PageHead, Empty, MetricRibbon, MetricCard } from "../ui.jsx";
import { IconBilling, IconCheck, IconSparkles } from "../icons.jsx";
import { today, fmtShort } from "../../lib/date.js";
import { formatMoney, currencySymbol } from "../../lib/currency.js";

const PAYER_TYPES = [
  { key: "medicaid", label: "Medicaid" },
  { key: "private", label: "Private Insurance" },
  { key: "self_pay", label: "Self Pay" },
];

const CLAIM_STATUSES = [
  { key: "not_billed", label: "Not Billed", badge: "" },
  { key: "submitted", label: "Submitted", badge: "hotTag" },
  { key: "pending", label: "Pending Review", badge: "hotTag" },
  { key: "paid", label: "Paid / Reimbursed", badge: "ok" },
  { key: "denied", label: "Denied", badge: "bad" },
];

export default function BillingTracker({ db, up, toast }) {
  const curr = db.currency || "USD";
  const sym = currencySymbol(curr);
  const [filterPending, setFilterPending] = useState(false);
  const clients = db.clients || [];

  // Map billing tracker state per client, defaulting if not yet tracked
  const records = clients.map((c) => {
    const existing = (db.billingTracker || []).find((b) => b.clientId === c.id);
    return (
      existing || {
        clientId: c.id,
        payerType: "self_pay",
        claimStatus: "not_billed",
        amount: c.fee || 0,
        notes: "",
        updatedAt: today(),
      }
    );
  });

  // Calculate metrics
  const totalValue = records.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const pendingRecords = records.filter(
    (r) => r.claimStatus === "pending" || r.claimStatus === "submitted"
  );
  const pendingValue = pendingRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const paidRecords = records.filter((r) => r.claimStatus === "paid");
  const paidValue = paidRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  const filteredRecords = filterPending ? pendingRecords : records;

  const updateRecord = (clientId, patch) => {
    const existingList = db.billingTracker || [];
    const index = existingList.findIndex((b) => b.clientId === clientId);
    let updated;

    if (index >= 0) {
      updated = existingList.map((b) =>
        b.clientId === clientId ? { ...b, ...patch, updatedAt: today() } : b
      );
    } else {
      const base = records.find((r) => r.clientId === clientId);
      updated = [...existingList, { ...base, ...patch, updatedAt: today() }];
    }

    up({ billingTracker: updated });
    toast("Billing status updated");
  };

  return (
    <>
      <PageHead
        eyebrow="Reimbursement"
        title="Billing Tracker"
        sub="Track Medicaid, private insurance, and self-pay claim statuses per client."
      />

      {/* Financial Metric Ribbon */}
      <MetricRibbon cols={3}>
        <MetricCard
          title="Total Claims Portfolio"
          value={formatMoney(totalValue, curr)}
          sub={`${records.length} client files tracked`}
          icon={IconBilling}
          variant="default"
        />
        <MetricCard
          title="Pending Reimbursement"
          value={formatMoney(pendingValue, curr)}
          sub={`${pendingRecords.length} claims in adjudication`}
          icon={IconSparkles}
          variant={pendingRecords.length > 0 ? "warn" : "ok"}
          badge={pendingRecords.length > 0 ? "Pending" : "Clear"}
        />
        <MetricCard
          title="Total Reimbursed"
          value={formatMoney(paidValue, curr)}
          sub={`${paidRecords.length} claims settled`}
          icon={IconCheck}
          variant="ok"
          badge="Settled"
        />
      </MetricRibbon>

      {/* Filter Tabs */}
      <div className="filter-pill-row">
        <button
          type="button"
          className={"pill " + (!filterPending ? "on" : "")}
          onClick={() => setFilterPending(false)}
        >
          All Clients ({records.length})
        </button>
        <button
          type="button"
          className={"pill " + (filterPending ? "on" : "")}
          onClick={() => setFilterPending(true)}
        >
          Pending / Submitted Only ({pendingRecords.length})
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {filteredRecords.length === 0 && (
          <Empty icon={IconBilling}>
            No pending claims found. All client claims are either not billed or reimbursed.
          </Empty>
        )}

        <div className="billing-table-wrap">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Payer Type</th>
                <th>Claim Fee ({sym})</th>
                <th>Claim Status</th>
                <th>Notes / Policy ID</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => {
                const client = clients.find((c) => c.id === r.clientId);
                const initials = client?.name
                  ? client.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0].toUpperCase())
                      .join("")
                  : "CL";

                return (
                  <tr key={r.clientId}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="client-avatar small">{initials}</div>
                        <div>
                          <b style={{ display: "block" }}>{client?.name || "Client"}</b>
                          <span style={{ fontSize: 11, color: "var(--charcoal-muted)" }}>
                            {client?.phone || client?.email || ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={r.payerType}
                        onChange={(e) => updateRecord(r.clientId, { payerType: e.target.value })}
                      >
                        {PAYER_TYPES.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        style={{ width: 110 }}
                        value={r.amount}
                        onChange={(e) => updateRecord(r.clientId, { amount: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={r.claimStatus}
                        onChange={(e) => updateRecord(r.clientId, { claimStatus: e.target.value })}
                      >
                        {CLAIM_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={r.notes || ""}
                        placeholder="e.g. Medicaid ID #849204"
                        onChange={(e) => updateRecord(r.clientId, { notes: e.target.value })}
                      />
                    </td>
                    <td style={{ fontSize: 12, color: "var(--rose)" }}>
                      {r.updatedAt ? fmtShort(r.updatedAt) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
