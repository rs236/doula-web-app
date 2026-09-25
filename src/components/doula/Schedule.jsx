import { useState } from "react";
import { PageHead, Card, Empty, Field } from "../ui.jsx";
import { today, addDays, fmtShort, uid } from "../../lib/date.js";

const TYPES = [
  "Discovery Call",
  "Prenatal Visit",
  "Prenatal Visit 1",
  "Prenatal Visit 2",
  "Prenatal Visit 3",
  "Postpartum Visit",
  "Birth Debrief",
];

export default function Schedule({ db, up, toast }) {
  const [s, setS] = useState({
    date: addDays(today(), 2),
    time: "10:00",
    type: "Prenatal Visit",
    mode: "In person",
  });
  const t = today();
  const booked = db.appts
    .filter((a) => a.date >= t)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));
  const open = db.slots
    .filter((x) => !x.clientId && x.date >= t)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));

  return (
    <>
      <PageHead
        eyebrow="Availability"
        title="Schedule"
        sub="Publish open slots. Clients book themselves — no back-and-forth texting."
      />

      <Card title="Publish a slot">
        <div className="fgrid">
          <Field label="Date">
            <input type="date" value={s.date} onChange={(e) => setS({ ...s, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <input type="time" value={s.time} onChange={(e) => setS({ ...s, time: e.target.value })} />
          </Field>
          <Field label="Visit type">
            <select value={s.type} onChange={(e) => setS({ ...s, type: e.target.value })}>
              {TYPES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Mode">
            <select value={s.mode} onChange={(e) => setS({ ...s, mode: e.target.value })}>
              <option>In person</option>
              <option>Video</option>
              <option>Phone</option>
            </select>
          </Field>
        </div>
        <button
          className="primary"
          onClick={() => {
            up((d) => ({ slots: [...d.slots, { ...s, id: uid(), clientId: null }] }));
            toast("Slot published to the client portal");
          }}
        >
          Publish slot
        </button>
      </Card>

      <div className="grid2">
        <Card title="Booked visits" count={booked.length}>
          {booked.length === 0 && <Empty>Nothing booked yet.</Empty>}
          {booked.map((a) => {
            const c = db.clients.find((x) => x.id === a.clientId);
            return (
              <div className="row" key={a.id}>
                <div className="rowdate">
                  <b>{fmtShort(a.date)}</b>
                  <span>{a.time}</span>
                </div>
                <div className="rowbody">
                  <b>{c ? c.name : "Unknown client"}</b>
                  <span>
                    {a.type} · {a.mode}
                  </span>
                </div>
                <button
                  className="ghost"
                  onClick={() => {
                    up((d) => ({ appts: d.appts.filter((x) => x.id !== a.id) }));
                    toast("Visit cancelled");
                  }}
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </Card>

        <Card title="Open slots" count={open.length}>
          {open.length === 0 && <Empty>No open slots. Clients can't book.</Empty>}
          {open.map((x) => (
            <div className="row" key={x.id}>
              <div className="rowdate">
                <b>{fmtShort(x.date)}</b>
                <span>{x.time}</span>
              </div>
              <div className="rowbody">
                <b>{x.type}</b>
                <span>{x.mode}</span>
              </div>
              <button className="ghost" onClick={() => up((d) => ({ slots: d.slots.filter((y) => y.id !== x.id) }))}>
                Remove
              </button>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
