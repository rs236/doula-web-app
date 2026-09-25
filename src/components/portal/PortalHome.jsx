import { motion } from "motion/react";
import { PageHead, Card, Empty, MetricRibbon, MetricCard } from "../ui.jsx";
import { IconSchedule, IconDocs, IconSparkles } from "../icons.jsx";
import { ga, gaLabel, fmt, fmtShort, today, daysBetween } from "../../lib/date.js";
import { resolveForm } from "../../lib/formEngine.js";

export default function PortalHome({ db, c, go }) {
  const mine = db.assigned.filter((a) => a.clientId === c.id);
  const openDocs = mine.filter((a) => !a.completedOn);
  const next = (db.appts || db.bookings || [])
    .filter((a) => (a.clientId === c.id || a.client_id === c.id) && (a.date >= today() || a.slot_time >= today()))
    .sort((a, b) => ((a.date || a.slot_time) > (b.date || b.slot_time) ? 1 : -1))[0];
  const g = ga(c.edd);
  const backup = (db.backups || []).find((b) => b.id === c.backupId);

  const daysLeft = Math.max(0, daysBetween(today(), c.edd));
  const weekNumber = Math.min(42, Math.max(1, g.w || 32));
  const progressPercent = Math.min(100, Math.round((weekNumber / 40) * 100));

  return (
    <>
      <PageHead
        eyebrow={`${gaLabel(c.edd)} · Estimated Due ${fmt(c.edd)}`}
        title={`Hello ${c.name.split(" ")[0]}`}
        sub="Your personal birth space: care plans, paperwork, and appointment booking."
      />

      {/* Pregnancy Journey Progress Ribbon */}
      <div className="pregnancy-journey-banner">
        <div className="pregnancy-journey-top">
          <div>
            <span className="journey-eyebrow">Your Pregnancy Journey</span>
            <div className="journey-weeks">{gaLabel(c.edd)}</div>
          </div>
          <div className="journey-countdown">
            <b>{daysLeft}</b>
            <span>days to EDD</span>
          </div>
        </div>

        <div className="pregnancy-track-bar">
          <motion.div
            className="pregnancy-track-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="pregnancy-track-labels">
          <span>First Trimester</span>
          <span>Second Trimester</span>
          <span>Third Trimester</span>
          <span>Birth</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <MetricRibbon cols={3}>
        <MetricCard
          title="Gestation Stage"
          value={gaLabel(c.edd)}
          sub={`Due on ${fmtShort(c.edd)}`}
          icon={IconSparkles}
          variant="ok"
          badge="On Track"
        />
        <MetricCard
          title="Countdown"
          value={`${daysLeft} Days`}
          sub="Estimated arrival window"
          icon={IconSchedule}
          variant="default"
        />
        <MetricCard
          title="Forms to Sign"
          value={openDocs.length}
          sub={openDocs.length === 0 ? "All paperwork completed" : "Awaiting your review"}
          icon={IconDocs}
          variant={openDocs.length > 0 ? "warn" : "ok"}
          badge={openDocs.length > 0 ? "Action" : "Clear"}
        />
      </MetricRibbon>

      {g.w >= 37 && (
        <div className="oncallnote">
          <div style={{ fontSize: 20 }}>🌿</div>
          <div>
            <b>You are in your 37+ week on-call window.</b>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--charcoal-muted)" }}>
              I am on 24/7 labor watch for you. Call me day or night as soon as contractions establish or waters break.
              {backup && ` If I am attending another birth, my verified backup ${backup.name} is on immediate alert.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid2" style={{ marginTop: 20 }}>
        <Card title="Your Next Visit" spotlight>
          {next ? (
            <div className="row">
              <div className="rowdate">
                <b>{fmtShort(next.date || next.slot_time)}</b>
                <span>{next.time || (next.slot_time ? new Date(next.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "")}</span>
              </div>
              <div className="rowbody">
                <b>{next.type || "Prenatal Visit"}</b>
                <span>{next.mode || "Confirmed with Doula"}</span>
              </div>
            </div>
          ) : (
            <Empty icon={IconSchedule}>No visit scheduled yet. Pick an available appointment slot below.</Empty>
          )}
          <button className="primary wide" onClick={() => go("p-book")} style={{ marginTop: 12 }}>
            📅 Book or reschedule a visit
          </button>
        </Card>

        <Card title="Pending Forms & Agreements" count={openDocs.length} spotlight>
          {openDocs.length === 0 ? (
            <Empty icon={IconDocs}>All forms and contracts are filled and digitally signed. You are completely up to date!</Empty>
          ) : (
            openDocs.map((a) => {
              const f = resolveForm(db, a.formId);
              if (!f) return null;
              return (
                <div className="row" key={a.id}>
                  <div className="rowbody">
                    <b>{f.title}</b>
                    <span>{f.blurb || f.description || "Awaiting your input"}</span>
                  </div>
                  <button className="ghost small-btn" onClick={() => go("p-forms")}>
                    Fill form →
                  </button>
                </div>
              );
            })
          )}
          <button className="ghost wide" onClick={() => go("p-forms")} style={{ marginTop: 12 }}>
            View all my documents →
          </button>
        </Card>
      </div>

      {/* Client Care & Privacy Footer */}
      <footer className="portal-client-footer" style={{ marginTop: 32, padding: "18px 22px", background: "rgba(0,0,0,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.6)", fontSize: "12px", color: "var(--c-sub)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ maxWidth: 540 }}>
          <strong>🌿 Non-Clinical Doula Care Notice:</strong> Doula support provides physical, emotional, and informational care and does not constitute medical advice or diagnosis. For urgent health concerns or emergencies, contact your doctor/midwife or call emergency services (911/112).
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#/legal/medical-disclaimer" style={{ color: "var(--mauve)", textDecoration: "underline" }}>Medical Disclaimer</a>
          <span>·</span>
          <a href="#/legal/privacy" style={{ color: "var(--mauve)", textDecoration: "underline" }}>Privacy Rights</a>
          <span>·</span>
          <a href="#/data-request" style={{ color: "var(--mauve)", textDecoration: "underline" }}>Download My Records</a>
        </div>
      </footer>
    </>
  );
}
