import { useState } from "react";
import { PageHead, Card, Empty } from "../ui.jsx";
import { today, fmtShort, ga, uid } from "../../lib/date.js";
import { CHECK_Qs } from "../../data/forms.js";

export default function Postpartum({ db, up, toast }) {
  const ppClients = db.clients.filter((c) => c.status === "Postpartum" || ga(c.edd).days > 280);
  const first = ppClients[0] || db.clients[0];
  const [clientId, setClientId] = useState(first ? first.id : "");
  const [scores, setScores] = useState({});
  const [note, setNote] = useState("");

  const history = db.checkins
    .filter((k) => k.clientId === clientId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const submit = () => {
    if (!clientId) return;
    const vals = CHECK_Qs.map((q) => scores[q.id] || 3);
    const flagged = vals.some((v) => v <= 2) || vals.reduce((a, b) => a + b, 0) <= 12;
    up((d) => ({
      checkins: [...d.checkins, { id: uid(), clientId, date: today(), scores, note, flagged }],
    }));
    setScores({});
    setNote("");
    toast(flagged ? "Saved and flagged for follow-up" : "Check-in saved");
  };

  return (
    <>
      <PageHead
        eyebrow="Weeks one to six"
        title="Postpartum check-ins"
        sub="A short weekly pulse so nobody quietly slips through the six-week gap."
      />
      <div className="pickrow">
        <select className="mini" aria-label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {db.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Card title="New check-in">
        {CHECK_Qs.map((q) => (
          <div className="scalerow" key={q.id}>
            <span>{q.label}</span>
            <div className="scale">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={"sc " + (scores[q.id] === n ? "on" : "")}
                  onClick={() => setScores({ ...scores, [q.id]: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="hint" style={{ margin: "14px 0 12px", display: "block" }}>1 = not at all · 5 = most of the time</div>
        <textarea placeholder="In her words…" value={note} onChange={(e) => setNote(e.target.value)} />
        <div style={{ marginTop: 14 }}>
          <button className="primary" onClick={submit}>
            Save check-in
          </button>
        </div>
      </Card>

      <Card title="History">
        {history.length === 0 && <Empty>No check-ins recorded.</Empty>}
        {history.map((k) => (
          <div className="row" key={k.id}>
            <div className="rowdate">
              <b>{fmtShort(k.date)}</b>
            </div>
            <div className="rowbody">
              <b>{Object.values(k.scores).reduce((a, b) => a + b, 0)}/25</b>
              <span>{k.note || "No note"}</span>
            </div>
            {k.flagged && <span className="tag bad">Follow up</span>}
          </div>
        ))}
      </Card>

      <p className="disclaimer">
        This is a conversation prompt, not a screening or diagnostic tool. A flag means "call her and talk", and
        encourage her to contact her care provider. If she mentions thoughts of harming herself or her baby, treat it
        as urgent: contact her provider or emergency services the same day.
      </p>
    </>
  );
}
