import { useState } from "react";
import { PageHead, Card, Empty, KV, Field } from "../ui.jsx";
import { gaLabel, fmt, uid } from "../../lib/date.js";
import { prefSummary } from "../../lib/derive.js";

export default function Backup({ db, up, toast }) {
  const [b, setB] = useState({ name: "", phone: "", area: "", note: "" });
  const [handoff, setHandoff] = useState("");
  const c = handoff ? db.clients.find((x) => x.id === handoff) : null;

  const sheet = (x) =>
    [
      x.name + " — " + gaLabel(x.edd) + ", EDD " + fmt(x.edd),
      x.birthplace + " · " + x.provider,
      "Partner: " + x.partner,
      "Emergency: " + x.emergency,
      "Phone: " + x.phone,
      "Preferences: " + (prefSummary(db, x.id) || "not returned yet"),
    ].join("\n");

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Handoff sheet copied");
    } catch {
      toast("Copying is blocked in this browser — select the text instead");
    }
  };

  return (
    <>
      <PageHead
        eyebrow="The 3am problem"
        title="Backup cover"
        sub="Keep a real bench, and hand over a client in one tap instead of a panicked voice note."
      />

      <Card title="Add a backup doula">
        <div className="fgrid">
          <Field label="Name">
            <input value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input value={b.phone} onChange={(e) => setB({ ...b, phone: e.target.value })} />
          </Field>
          <Field label="Area covered">
            <input value={b.area} onChange={(e) => setB({ ...b, area: e.target.value })} />
          </Field>
          <Field label="Note">
            <input value={b.note} onChange={(e) => setB({ ...b, note: e.target.value })} />
          </Field>
        </div>
        <button
          className="primary"
          onClick={() => {
            if (!b.name.trim()) return toast("Name required");
            up((d) => ({ backups: [...d.backups, { ...b, id: uid() }] }));
            setB({ name: "", phone: "", area: "", note: "" });
            toast("Backup added");
          }}
        >
          Add backup
        </button>
      </Card>

      <div className="grid2">
        <Card title="Your bench">
          {db.backups.length === 0 && <Empty>No backup doulas yet. This is the first thing to fix.</Empty>}
          {db.backups.map((x) => (
            <div className="row" key={x.id}>
              <div className="rowbody">
                <b>{x.name}</b>
                <span>
                  {x.area} · {x.phone}
                </span>
              </div>
              <span className="hint">{db.clients.filter((y) => y.backupId === x.id).length} assigned</span>
            </div>
          ))}
        </Card>

        <Card title="Generate a handoff sheet">
          <select
            className="mini wide"
            aria-label="Client to hand over"
            value={handoff}
            onChange={(e) => setHandoff(e.target.value)}
          >
            <option value="">Choose a client</option>
            {db.clients.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          {c && (
            <div className="handoff">
              <b>{c.name}</b> · {gaLabel(c.edd)} · EDD {fmt(c.edd)}
              <KV k="Birth place" v={c.birthplace} />
              <KV k="Provider" v={c.provider} />
              <KV k="Partner" v={c.partner} />
              <KV k="Emergency" v={c.emergency} />
              <KV k="Phone" v={c.phone} />
              <KV k="Preferences" v={prefSummary(db, c.id) || "Birth preferences not returned yet"} />
              <button className="ghost wide" onClick={() => copy(sheet(c))}>
                Copy handoff sheet
              </button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
