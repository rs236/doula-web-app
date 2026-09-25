import { useState } from "react";
import { PageHead, Card, Field } from "../ui.jsx";
import { clearDb } from "../../lib/storage.js";
import { CURRENCIES, getCurrency } from "../../lib/currency.js";

export default function Settings({ db, up, toast, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const curr = db.currency || "USD";
  const cInfo = getCurrency(curr);

  return (
    <>
      <PageHead
        eyebrow="This browser only"
        title="Settings"
        sub="Where your data lives, currency preferences, and how to start clean."
      />

      <Card title="Practice & Currency Settings">
        <Field label="Choose practice currency">
          <select
            value={curr}
            onChange={(e) => {
              const next = e.target.value;
              up(() => ({ currency: next }));
              toast(`Practice currency set to ${next}`);
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <span className="hint" style={{ marginTop: 4, display: "block" }}>
            All invoices, claim fee trackers, revenue metrics, and payment records display in {cInfo.label}.
          </span>
        </Field>

        <Field label={`Mileage deduction rate (${cInfo.rateLabel})`}>
          <input
            type="number"
            step="0.01"
            value={db.rate}
            onChange={(e) => up(() => ({ rate: Number(e.target.value) || 0 }))}
          />
        </Field>
      </Card>

      <Card title="Your data">
        <p className="plain">
          Everything you enter is saved in this browser only. There is no account and no server, so your
          records don't travel to another device, and anyone using this browser profile can see them.
          Clearing site data or using private browsing will remove the practice.
        </p>
        <div className="actions">
          <button
            className="ghost"
            onClick={() => {
              const blob = JSON.stringify(db, null, 2);
              const url = URL.createObjectURL(new Blob([blob], { type: "application/json" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = "doula-practice-backup.json";
              a.click();
              URL.revokeObjectURL(url);
              toast("Backup downloaded");
            }}
          >
            Download a backup
          </button>
          {confirming ? (
            <button
              className="primary danger"
              onClick={() => {
                clearDb();
                onReset();
                setConfirming(false);
                toast("Practice reset to the demo data");
              }}
            >
              Yes, erase and reload demo data
            </button>
          ) : (
            <button className="ghost urgent" onClick={() => setConfirming(true)}>
              Reset everything
            </button>
          )}
        </div>
      </Card>
    </>
  );
}
