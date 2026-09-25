import { PageHead, Empty } from "../ui.jsx";
import { gaLabel, fmt } from "../../lib/date.js";

const CP = ({ k, v, wide }) =>
  v ? (
    <div className={"cp " + (wide ? "wide" : "")}>
      <span>{k}</span>
      <b>{v}</b>
    </div>
  ) : null;

const list = (v) => (Array.isArray(v) ? v.join(" · ") : v);

export default function CareCard({ db, c }) {
  const a = db.assigned.find((x) => x.clientId === c.id && x.formId === "birthprefs");
  const done = a && a.completedOn;
  const A = (a && a.answers) || {};

  return (
    <>
      <PageHead
        eyebrow="One page, printed, taped to the wall"
        title="Care team card"
        sub="Nurses change shift every twelve hours. This is the version they'll actually read."
      />
      {!done && <Empty>Fill in your birth preferences and this builds itself.</Empty>}
      {done && (
        <>
          <div className="card-print">
            <div className="cpname">{c.name}</div>
            <div className="cpsub">
              {gaLabel(c.edd)} · due {fmt(c.edd)} · {c.provider}
            </div>
            <div className="cpgrid">
              <CP k="Pain relief" v={A.pain} />
              <CP k="Monitoring" v={A.monitor} />
              <CP k="Pushing" v={A.pushing} />
              <CP k="Feeding" v={A.feeding} />
              <CP k="In the room" v={A.support} />
              <CP k="Environment" v={list(A.vibe)} />
              <CP k="Comfort measures" v={list(A.comfort)} wide />
              <CP k="After birth" v={list(A.after)} wide />
              <CP k="Please don't offer" v={A.avoid} wide />
              <CP k="If a caesarean is needed" v={A.cesarean} wide />
            </div>
            <div className="cpfoot">
              Support person: {c.partner} · Emergency: {c.emergency}
              <br />
              Preferences, not demands. We'll follow clinical guidance and want to be part of the conversation.
            </div>
          </div>
          <button className="ghost wide noprint" onClick={() => window.print()}>
            Print this page
          </button>
        </>
      )}
    </>
  );
}
