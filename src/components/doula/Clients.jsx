import { useState } from "react";
import { motion } from "motion/react";
import { PageHead, Card, Empty, KV, Field, MetricRibbon, MetricCard, StatusBadge, CopyButton } from "../ui.jsx";
import { IconClients, IconDocs, IconSparkles, IconPlus, IconSearch } from "../icons.jsx";
import { gaLabel, today, fmt, fmtShort, uid } from "../../lib/date.js";
import { PACKET } from "../../data/forms.js";
import { resolveForm, assignmentStatus } from "../../lib/formEngine.js";
import { SPRINGS } from "../motion/MotionPrimitives.jsx";

const STATUS_CLASS = { Completed: "ok", Signed: "ok", Expired: "bad" };

const STATUSES = [
  { key: "lead", label: "Lead" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const blank = () => ({
  name: "",
  email: "",
  phone: "",
  edd: today(),
  provider: "",
  birthplace: "",
  notes: "",
  package: "Full Doula Care",
  fee: 1500,
});

export default function Clients({ db, up, open, setOpen, toast, setTab }) {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [f, setF] = useState(blank);
  const c = db.clients.find((x) => x.id === open);

  if (c) return <ClientDetail db={db} up={up} c={c} setOpen={setOpen} toast={toast} setTab={setTab} />;

  const totalClients = db.clients.length;
  const activeCount = db.clients.filter((x) => (x.status || "lead").toLowerCase() === "active").length;
  const leadCount = db.clients.filter((x) => (x.status || "lead").toLowerCase() === "lead").length;
  const pendingDocsCount = db.assigned.filter((a) => !a.completedOn).length;

  const filteredClients = db.clients.filter((x) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      x.name?.toLowerCase().includes(q) ||
      x.email?.toLowerCase().includes(q) ||
      x.phone?.toLowerCase().includes(q) ||
      x.birthplace?.toLowerCase().includes(q)
    );
  });

  const addClient = () => {
    if (!f.name.trim()) return toast("Add a client name first");
    const id = uid();
    const token = uid() + uid();

    // The 3 priority V1 templates: Intake, Service Agreement, Birth Plan
    const packet = PACKET.map((fid) => ({
      id: uid(),
      clientId: id,
      formId: fid,
      sentOn: today(),
      answers: {},
      signedOn: null,
      completedOn: null,
    }));

    const newClient = {
      ...f,
      id,
      status: "lead",
      access_token: token,
      accessToken: token,
      createdAt: today(),
    };

    up((d) => ({
      clients: [...d.clients, newClient],
      assigned: [...d.assigned, ...packet],
      invoices: d.invoices || [],
      billingTracker: d.billingTracker || [],
    }));

    setAdding(false);
    setF(blank());
    toast("Client created — Intake, Agreement & Birth Plan sent");
  };

  return (
    <>
      <PageHead
        eyebrow="Caseload Management"
        title="Clients"
        sub="Your families, intake documents, and zero-login magic portal links."
        action={
          <button className="primary" onClick={() => setAdding(!adding)}>
            {adding ? "Cancel" : <><IconPlus size={15} style={{ marginRight: 6 }} /> Add a client</>}
          </button>
        }
      />

      {/* KPI Ribbon */}
      <MetricRibbon cols={3}>
        <MetricCard
          title="Total Families"
          value={totalClients}
          sub={`${leadCount} pending leads`}
          icon={IconClients}
          variant="default"
        />
        <MetricCard
          title="Active Care"
          value={activeCount}
          sub="Under prenatal / birth care"
          icon={IconSparkles}
          variant="ok"
          badge="In Care"
        />
        <MetricCard
          title="Open Paperwork"
          value={pendingDocsCount}
          sub="Awaiting client signature"
          icon={IconDocs}
          variant={pendingDocsCount > 0 ? "warn" : "ok"}
          badge={pendingDocsCount > 0 ? "Action" : "Clear"}
        />
      </MetricRibbon>

      {adding && (
        <Card title="New Client Onboarding" spotlight>
          <div className="fgrid">
            <Field label="Full name" required>
              <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Sarah Miller" />
            </Field>
            <Field label="Email address">
              <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="sarah@example.com" />
            </Field>
            <Field label="Phone number">
              <input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="(555) 234-5678" />
            </Field>
            <Field label="Estimated due date">
              <input type="date" value={f.edd} onChange={(e) => setF({ ...f, edd: e.target.value })} />
            </Field>
            <Field label="Care provider / OB-GYN">
              <input value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} placeholder="e.g. Dr. Sterling / Midwife Group" />
            </Field>
            <Field label="Hospital or Place of birth">
              <input value={f.birthplace} onChange={(e) => setF({ ...f, birthplace: e.target.value })} placeholder="e.g. St. Jude Hospital / Home" />
            </Field>
          </div>

          <Field label="Initial notes">
            <textarea
              rows={3}
              value={f.notes}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
              placeholder="Initial consult takeaways, medical background, special preferences..."
            />
          </Field>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
            <button className="primary" onClick={addClient}>
              Create client & send 3 priority forms
            </button>
            <span className="hint">
              Automatically assigns Intake, Doula Agreement & Birth Plan to their portal.
            </span>
          </div>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <IconSearch size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, birthplace..."
          />
        </div>
      </div>

      <div className="cardgrid" style={{ marginTop: 16 }}>
        {filteredClients.length === 0 && (
          <Empty icon={IconClients}>
            {search ? "No clients match your search query." : "No clients yet. Click 'Add a client' above."}
          </Empty>
        )}
        {filteredClients.map((x) => {
          const clientStatus = (x.status || "lead").toLowerCase();
          const openDocs = db.assigned.filter((a) => a.clientId === x.id && !a.completedOn).length;
          const token = x.access_token || x.accessToken || x.id;
          const portalUrl = `${window.location.origin}${window.location.pathname}#/portal/${token}`;

          // Initials
          const initials = x.name
            ? x.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0].toUpperCase())
                .join("")
            : "C";

          return (
            <motion.div
              key={x.id}
              className="clientcard"
              onClick={() => setOpen(x.id)}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={SPRINGS.tactile}
            >
              <div className="clientcard-top">
                <div className="client-avatar">{initials}</div>
                <div className="clientcard-meta">
                  <div className="client-name">{x.name}</div>
                  <div className="client-ga">{gaLabel(x.edd)}</div>
                </div>
                <StatusBadge status={clientStatus} />
              </div>

              <div className="clientcard-body">
                <div className="client-edd">
                  📅 EDD {fmt(x.edd)} {x.birthplace ? `· ${x.birthplace}` : ""}
                </div>
                <div className="client-paperwork-tag">
                  {openDocs === 0 ? (
                    <span className="text-ok">✓ All forms signed</span>
                  ) : (
                    <span className="text-warn">⏳ {openDocs} form{openDocs > 1 ? "s" : ""} pending</span>
                  )}
                </div>
              </div>

              <div className="clientcard-foot" onClick={(e) => e.stopPropagation()}>
                <CopyButton text={portalUrl} label="Magic link" copiedLabel="Copied link" />
                <button
                  type="button"
                  className="ghost small-btn"
                  onClick={() => setOpen(x.id)}
                  title="View client profile"
                >
                  Profile →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function ClientDetail({ db, up, c, setOpen, toast, setTab }) {
  const mine = db.assigned.filter((a) => a.clientId === c.id);
  const appts = (db.bookings || db.appts || []).filter((a) => a.clientId === c.id || a.client_id === c.id);
  const clientStatus = (c.status || "lead").toLowerCase();
  const token = c.access_token || c.accessToken || c.id;

  const portalUrl = `${window.location.origin}${window.location.pathname}#/portal/${token}`;

  const updateStatus = (newStatus) => {
    up((d) => ({
      clients: d.clients.map((x) => (x.id === c.id ? { ...x, status: newStatus } : x)),
    }));
    toast(`Client status updated to ${newStatus}`);
  };

  const saveNotes = (val) => {
    up((d) => ({
      clients: d.clients.map((x) => (x.id === c.id ? { ...x, notes: val } : x)),
    }));
  };

  return (
    <>
      <button className="back" onClick={() => setOpen(null)}>
        ← All clients
      </button>

      <PageHead
        eyebrow={`${gaLabel(c.edd)} · Due ${fmt(c.edd)}`}
        title={c.name}
        sub={[c.phone, c.email, c.provider, c.birthplace].filter(Boolean).join(" · ")}
        action={<StatusBadge status={clientStatus} />}
      />

      <div className="statusrow">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            className={"pill " + (clientStatus === s.key ? "on" : "")}
            onClick={() => updateStatus(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Shareable Client Magic-Link Box */}
      <Card title="Zero-Login Client Portal Magic Link" spotlight>
        <p className="hint" style={{ marginTop: 0 }}>
          Your client accesses their forms, birth plan, and appointment booking directly through this private link without needing to create an account or remember passwords:
        </p>
        <div className="token-box">
          <code>{portalUrl}</code>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <CopyButton text={portalUrl} label="Copy Magic Link" />
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ghost"
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              Open Portal ↗
            </a>
          </div>
        </div>
      </Card>

      <div className="grid2" style={{ marginTop: 18 }}>
        {/* Freeform Notes Field */}
        <Card title="Clinical & Practice Notes">
          <Field label="Auto-saving visit notes, preferences & history">
            <textarea
              rows={7}
              defaultValue={c.notes || ""}
              onBlur={(e) => {
                saveNotes(e.target.value);
                toast("Notes saved");
              }}
              placeholder="Record notes on labor preferences, partner dynamics, health history, or visit summaries..."
            />
          </Field>
          <span className="hint">Changes auto-save upon leaving the text area.</span>
        </Card>

        {/* Paperwork Status */}
        <Card title="Document Library & Signatures">
          {mine.length === 0 && <Empty>No documents assigned yet.</Empty>}
          {mine.map((a) => {
            const form = resolveForm(db, a.formId);
            if (!form) return null;
            const status = assignmentStatus(a, form);
            return (
              <div className="row" key={a.id}>
                <div className="rowbody">
                  <b>{form.title}</b>
                  <span>
                    {a.completedOn ? `Completed ${fmtShort(a.completedOn)}` : `Sent ${fmtShort(a.sentOn)}`}
                    {a.signedName && ` · Signed by ${a.signedName}`}
                  </span>
                </div>
                <span className={"tag " + (STATUS_CLASS[status] || "")}>{status}</span>
              </div>
            );
          })}
          <button className="ghost wide" onClick={() => setTab("docs")}>
            Manage documents & templates →
          </button>
        </Card>
      </div>

      <div className="grid2" style={{ marginTop: 18 }}>
        <Card title="Client Record & Birth Location">
          <KV k="Email" v={c.email || "Not recorded"} />
          <KV k="Phone" v={c.phone || "Not recorded"} />
          <KV k="Provider" v={c.provider || "Not recorded"} />
          <KV k="Birthplace" v={c.birthplace || "Not recorded"} />
          <KV k="Caseload Status" v={clientStatus.toUpperCase()} highlight />
        </Card>

        <Card title="Appointments & Visits">
          {appts.length === 0 && <Empty>No appointments scheduled yet.</Empty>}
          {appts.map((a) => (
            <div className="row" key={a.id}>
              <div className="rowdate">
                <b>{fmtShort(a.date || a.slot_time)}</b>
                <span>{a.time || (a.slot_time ? new Date(a.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "")}</span>
              </div>
              <div className="rowbody">
                <b>{a.type || "Prenatal Visit"}</b>
                <span>{a.status || "confirmed"}</span>
              </div>
            </div>
          ))}
          <button className="ghost wide" onClick={() => setTab("schedule")}>
            Manage schedule & availability →
          </button>
        </Card>
      </div>
    </>
  );
}
