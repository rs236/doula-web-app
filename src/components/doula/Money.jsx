import { PageHead, Card, Empty, Stat } from "../ui.jsx";
import { ga, today } from "../../lib/date.js";
import { formatMoney } from "../../lib/currency.js";

export default function Money({ db, up }) {
  const curr = db.currency || "USD";
  const collected = db.payments.filter((p) => p.paidOn).reduce((a, b) => a + b.amount, 0);
  const due = db.payments.filter((p) => !p.paidOn).reduce((a, b) => a + b.amount, 0);

  return (
    <>
      <PageHead
        eyebrow="Cash position"
        title="Payments"
        sub="Milestones tied to gestational week, not calendar dates — so nothing lands after the birth."
      />
      <div className="stats">
        <Stat label="Collected" value={formatMoney(collected, curr)} />
        <Stat label="Outstanding" value={formatMoney(due, curr)} />
        <Stat label="Active clients" value={db.clients.filter((c) => c.status !== "Closed").length} />
      </div>

      <Card title="Schedule">
        {db.payments.length === 0 && <Empty>No payments scheduled.</Empty>}
        {db.payments.map((p) => {
          const c = db.clients.find((x) => x.id === p.clientId);
          if (!c) return null;
          const overdue = !p.paidOn && ga(c.edd).w >= p.dueWeek;
          return (
            <div className="row" key={p.id}>
              <div className="rowbody">
                <b>{c.name}</b>
                <span>
                  {p.label} · due at {p.dueWeek}w
                </span>
              </div>
              <b className="amt">{formatMoney(p.amount, curr)}</b>
              {p.paidOn ? (
                <span className="tag ok">Paid</span>
              ) : (
                <button
                  className={"ghost " + (overdue ? "urgent" : "")}
                  onClick={() =>
                    up((d) => ({
                      payments: d.payments.map((x) => (x.id === p.id ? { ...x, paidOn: today() } : x)),
                    }))
                  }
                >
                  {overdue ? "Overdue — mark paid" : "Mark paid"}
                </button>
              )}
            </div>
          );
        })}
      </Card>
    </>
  );
}
