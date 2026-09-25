import { PageHead, Card, Empty } from "../ui.jsx";
import { ga, gaLabel, today, fmtShort } from "../../lib/date.js";

export default function Today({ db, alerts, onOpen }) {
  const t = today();
  const upcoming = db.appts
    .filter((a) => a.date >= t)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));
  const oncall = db.clients.filter((c) => ga(c.edd).w >= 38 && c.status !== "Postpartum" && c.status !== "Closed");

  return (
    <>
      <PageHead
        eyebrow="Your practice at a glance"
        title="Today"
        sub="What needs you, in the order it needs you."
      />
      <div className="grid2">
        <Card title="Needs attention" count={alerts.length}>
          {alerts.length === 0 && <Empty>Nothing outstanding. Enjoy it.</Empty>}
          {alerts.map((a, i) => (
            <button key={i} className={"alert " + a.tone} onClick={() => onOpen(a.clientId)}>
              <span className="pip" />
              {a.text}
            </button>
          ))}
        </Card>

        <Card title="Next visits">
          {upcoming.length === 0 && <Empty>No visits booked. Publish some slots.</Empty>}
          {upcoming.slice(0, 6).map((a) => {
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
              </div>
            );
          })}
        </Card>
      </div>

      <Card title="On-call right now" count={oncall.length}>
        {oncall.length === 0 && <Empty>No one is in their on-call window.</Empty>}
        {oncall.map((c) => {
          const b = db.backups.find((x) => x.id === c.backupId);
          return (
            <div className="row" key={c.id}>
              <div className="rowdate">
                <b>{gaLabel(c.edd)}</b>
                <span>EDD {fmtShort(c.edd)}</span>
              </div>
              <div className="rowbody">
                <b>{c.name}</b>
                <span>
                  {c.birthplace} · backup {b ? b.name : "— not set"}
                </span>
              </div>
              <a className="ghost" href={"tel:" + c.phone}>
                Call
              </a>
            </div>
          );
        })}
      </Card>
    </>
  );
}
