import { PageHead, Card } from "../ui.jsx";
import { ga, gaLabel } from "../../lib/date.js";

const LOW = 34;
const HIGH = 42;

export default function OnCall({ db, up, onOpen }) {
  const pos = (edd) => {
    const wk = ga(edd).days / 7;
    return Math.max(0, Math.min(100, ((wk - LOW) / (HIGH - LOW)) * 100));
  };
  const active = db.clients.filter((c) => c.status !== "Closed");

  return (
    <>
      <PageHead
        eyebrow="The thing no calendar shows you"
        title="On-call board"
        sub="Every client plotted by gestational week, so you can see your next four weeks of exposure at a glance."
      />

      <div className="band">
        <div className="bandscroll">
          <div className="bandinner">
            <div className="bandtrack">
              <div className="bandfill" />
              <div className="oncallzone" />
              {[34, 36, 38, 40, 42].map((w) => (
                <div className="tick" key={w} style={{ left: ((w - LOW) / (HIGH - LOW)) * 100 + "%" }}>
                  <span>{w}w</span>
                </div>
              ))}
            </div>
            <div className="markers" style={{ height: Math.max(60, active.length * 46) + "px" }}>
              {active.map((c, i) => (
                <button
                  key={c.id}
                  className="marker"
                  style={{ left: pos(c.edd) + "%", top: i * 46 + "px" }}
                  onClick={() => onOpen(c.id)}
                >
                  <span className={"chip " + (ga(c.edd).w >= 38 ? "hot" : "")}>
                    {c.name.split(" ")[0]} · {gaLabel(c.edd)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bandlegend">
          <span className="lg hotlg" /> on-call window (38w → birth)
        </div>
      </div>

      <Card title="Coverage check">
        {active.map((c) => {
          const b = db.backups.find((x) => x.id === c.backupId);
          const weeks = ga(c.edd).w;
          return (
            <div className="row" key={c.id}>
              <div className="rowbody">
                <b>{c.name}</b>
                <span>
                  {gaLabel(c.edd)} · {c.status}
                </span>
              </div>
              <select
                className="mini"
                aria-label={"Backup doula for " + c.name}
                value={c.backupId || ""}
                onChange={(e) =>
                  up((d) => ({
                    clients: d.clients.map((x) =>
                      x.id === c.id ? { ...x, backupId: e.target.value || null } : x
                    ),
                  }))
                }
              >
                <option value="">No backup</option>
                {db.backups.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
              <span className={"tag " + (b ? "ok" : weeks >= 36 ? "bad" : "")}>
                {b ? "Covered" : "Uncovered"}
              </span>
            </div>
          );
        })}
      </Card>
    </>
  );
}
