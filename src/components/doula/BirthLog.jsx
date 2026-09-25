import { useState, useMemo } from "react";
import { PageHead, Card, Empty } from "../ui.jsx";
import { uid } from "../../lib/date.js";

const SUPPORT = ["Position change", "Water / shower", "Ate or drank", "Rested", "Vomiting", "Encouragement needed"];
const CLINICAL = ["Vaginal exam", "Provider arrived", "Membranes released", "Epidural placed", "Pushing began", "Baby born"];

const clock = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function BirthLog({ db, up, toast }) {
  const [clientId, setClientId] = useState(db.clients[0] ? db.clients[0].id : "");
  const [note, setNote] = useState("");

  const entries = db.logs.filter((l) => l.clientId === clientId).sort((a, b) => b.ts - a.ts);
  const contractions = entries.filter((e) => e.kind === "contraction");

  const freq = useMemo(() => {
    if (contractions.length < 2) return null;
    const recent = contractions.slice(0, 6);
    const gaps = [];
    for (let i = 0; i < recent.length - 1; i++) gaps.push(recent[i].ts - recent[i + 1].ts);
    return (gaps.reduce((a, b) => a + b, 0) / gaps.length / 60000).toFixed(1);
  }, [contractions]);

  const add = (kind, text) => {
    if (!clientId) return;
    up((d) => ({ logs: [...d.logs, { id: uid(), clientId, kind, text, ts: Date.now() }] }));
  };

  const summary = entries
    .slice()
    .reverse()
    .map(
      (e) =>
        clock(e.ts) +
        "  " +
        (e.kind === "contraction" ? "Contraction" : e.kind === "clinical" ? "Care team" : "Note") +
        " — " +
        e.text
    )
    .join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast("Timeline copied — paste into your birth story draft");
    } catch {
      toast("Copying is blocked in this browser — select the timeline instead");
    }
  };

  return (
    <>
      <PageHead
        eyebrow="During labour"
        title="Birth log"
        sub="Tap as it happens. Turns into a clean timeline for the birth story and your own records."
      />
      <div className="pickrow">
        <select className="mini" aria-label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {db.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {freq && <span className="hint">Contractions averaging {freq} min apart</span>}
      </div>

      <div className="tapbox">
        <div className="tap-section-label">⚡ Quick Event Logger (Tap to record)</div>
        <div className="tapgrid">
          <button className="tap big" onClick={() => add("contraction", "logged")}>
            Contraction
          </button>
          {SUPPORT.map((x) => (
            <button className="tap" key={x} onClick={() => add("support", x)}>
              {x}
            </button>
          ))}
          {CLINICAL.map((x) => (
            <button className="tap clin" key={x} onClick={() => add("clinical", x)}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <Card title="Free note">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What she said, what helped, what the room felt like…"
        />
        <button
          className="primary"
          onClick={() => {
            if (!note.trim()) return;
            add("note", note.trim());
            setNote("");
          }}
        >
          Add note
        </button>
      </Card>

      <Card title="Timeline" count={entries.length}>
        {entries.length === 0 && <Empty>Nothing logged yet. The first tap starts the clock.</Empty>}
        {entries.map((e) => (
          <div className="row" key={e.id}>
            <div className="rowdate">
              <b>{clock(e.ts)}</b>
            </div>
            <div className="rowbody">
              <b className={e.kind === "clinical" ? "clinlabel" : ""}>
                {e.kind === "contraction" ? "Contraction" : e.text}
              </b>
              <span>{e.kind === "contraction" ? "" : e.kind}</span>
            </div>
            <button className="ghost" onClick={() => up((d) => ({ logs: d.logs.filter((x) => x.id !== e.id) }))}>
              Delete
            </button>
          </div>
        ))}
        {entries.length > 0 && (
          <button className="ghost wide" onClick={copy}>
            Copy timeline
          </button>
        )}
      </Card>

      <p className="disclaimer">
        This is a support log, not a medical record. Clinical observations belong to the care team.
      </p>
    </>
  );
}
