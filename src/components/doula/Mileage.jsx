import { useState } from "react";
import { PageHead, Card, Empty, Stat, Field } from "../ui.jsx";
import { today, fmtShort, uid } from "../../lib/date.js";
import { formatMoney, getCurrency } from "../../lib/currency.js";

export default function Mileage({ db, up }) {
  const curr = db.currency || "USD";
  const cInfo = getCurrency(curr);
  const [t, setT] = useState({
    date: today(),
    clientId: db.clients[0] ? db.clients[0].id : "",
    purpose: "Prenatal Visit",
    km: 0,
  });
  const total = db.trips.reduce((a, b) => a + b.km, 0);

  return (
    <>
      <PageHead
        eyebrow="Deductible"
        title="Mileage"
        sub="Log the drive when you're still in the car, not at tax time."
      />
      <div className="stats">
        <Stat label="Distance logged" value={total + " km"} />
        <Stat label="Claimable" value={formatMoney(total * db.rate, curr)} />
        <Stat label="Rate" value={`${cInfo.symbol}${db.rate}/${cInfo.distUnit}`} />
      </div>

      <Card title="Log a trip">
        <div className="fgrid">
          <Field label="Date">
            <input type="date" value={t.date} onChange={(e) => setT({ ...t, date: e.target.value })} />
          </Field>
          <Field label="Client">
            <select value={t.clientId} onChange={(e) => setT({ ...t, clientId: e.target.value })}>
              {db.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Purpose">
            <input value={t.purpose} onChange={(e) => setT({ ...t, purpose: e.target.value })} />
          </Field>
          <Field label="Kilometres">
            <input type="number" value={t.km} onChange={(e) => setT({ ...t, km: Number(e.target.value) || 0 })} />
          </Field>
        </div>
        <button className="primary" onClick={() => up((d) => ({ trips: [...d.trips, { ...t, id: uid() }] }))}>
          Log trip
        </button>
      </Card>

      <Card title="Trips">
        {db.trips.length === 0 && <Empty>No trips logged.</Empty>}
        {db.trips.map((x) => {
          const c = db.clients.find((y) => y.id === x.clientId);
          return (
            <div className="row" key={x.id}>
              <div className="rowdate">
                <b>{fmtShort(x.date)}</b>
              </div>
              <div className="rowbody">
                <b>{c ? c.name : "—"}</b>
                <span>{x.purpose}</span>
              </div>
              <b className="amt">{x.km} km</b>
            </div>
          );
        })}
      </Card>
    </>
  );
}
