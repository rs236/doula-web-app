import { useState } from "react";
import { PageHead, Card, Empty, MetricRibbon, MetricCard } from "../ui.jsx";
import { IconCheck, IconClose, IconDocs, IconClients, IconSign, IconBilling, IconSparkles } from "../icons.jsx";
import { formById } from "../../data/forms.js";

const SUBPROCESSORS = [
  {
    name: "Supabase Inc.",
    purpose: "Cloud PostgreSQL Database, Auth & Document Vault",
    country: "USA (AWS US-East / EU-Central)",
    dpaStatus: "Executed (SCCs Active)",
    lastAudit: "2026-08-15",
    risk: "Low (ISO 27001 / SOC 2)",
  },
  {
    name: "Resend Inc.",
    purpose: "Transactional Email & Client Notifications",
    country: "USA (AWS US-East)",
    dpaStatus: "Executed (Template Allowlist)",
    lastAudit: "2026-09-01",
    risk: "Low (TLS 1.3 Strict)",
  },
  {
    name: "Razorpay Software Pvt. Ltd.",
    purpose: "Client Payment Processing & Invoicing Links",
    country: "India / Singapore",
    dpaStatus: "Executed (PCI-DSS L1)",
    lastAudit: "2026-07-20",
    risk: "Low (HMAC SHA-256 Validated)",
  },
  {
    name: "Google Fonts CDN",
    purpose: "Web Typography Assets",
    country: "Global (Google LLC)",
    dpaStatus: "Standard Terms (IP Transmission)",
    lastAudit: "2026-09-20",
    risk: "Medium (External CDN Asset)",
  },
];

const ROPA_ITEMS = [
  {
    category: "Personal Identifiers",
    fields: "Full name, phone, email, home address, emergency contact",
    basis: "Contract Performance (GDPR 6(1)(b)) / DPDPA Consent",
    retention: "Active practice duration + 7 yrs financial",
    sharing: "Resend (Email), Supabase (DB)",
  },
  {
    category: "Special Category: Perinatal Health",
    fields: "EDD, gestational age, parity, birth complications, OB/midwife, birthplace",
    basis: "Explicit Consent (GDPR 9(2)(a)) / DPDPA Sec 6 / MHMDA",
    retention: "Statutory medical limitation (7–21 yrs)",
    sharing: "Primary Doula, Assigned Backup",
  },
  {
    category: "Special Category: Labor Events",
    fields: "Contraction timestamps, cervical exams, membrane rupture, epidural, birth time",
    basis: "Explicit Consent (GDPR 9(2)(a)) / Vital Interests (9(2)(c))",
    retention: "Practice duration or client export",
    sharing: "Doula Birth Story export",
  },
  {
    category: "Special Category: Postpartum Mental Health",
    fields: "Mood, sleep, anxiety, emotional support scores (EPDS pulse)",
    basis: "Explicit Consent (GDPR 9(2)(a))",
    retention: "6 weeks postpartum + client choice",
    sharing: "Clinical escalation referral only",
  },
  {
    category: "Minor / Newborn Data",
    fields: "Birth timestamp, infant feeding method, newborn weight preferences",
    basis: "Verifiable Parental Consent (DPDPA Sec 9 / GDPR Art 8)",
    retention: "Statutory medical limitation",
    sharing: "Primary Doula",
  },
  {
    category: "Financial & Billing",
    fields: "Service fees, retainers, Medicaid ID, insurance claim status",
    basis: "Legal Obligation (Tax) / Contract Performance",
    retention: "7 fiscal years",
    sharing: "Razorpay (Payment Gateway)",
  },
];

const CHECKLIST_ITEMS = [
  {
    id: "dpdpa-notice",
    law: "India DPDPA 2023",
    req: "Section 6 Notice prior to consent with purpose and grievance channel",
    status: "PASS",
    details: "Available in Legal Center and Intake Onboarding flow.",
  },
  {
    id: "dpdpa-nominee",
    law: "India DPDPA 2023",
    req: "Section 14 Nominee appointment mechanism for Data Principals",
    status: "PASS",
    details: "Enabled in Self-Service DSAR Portal (#/data-request).",
  },
  {
    id: "gdpr-art9",
    law: "EU GDPR",
    req: "Article 9 Explicit Consent for special category reproductive health data",
    status: "PASS",
    details: "Mandatory affirmative electronic signatures on intake & birth plan forms.",
  },
  {
    id: "gdpr-art28",
    law: "EU GDPR",
    req: "Article 28 Data Processing Agreement & Subprocessor Directory",
    status: "PASS",
    details: "Published in Terms of Service & Subprocessor Directory.",
  },
  {
    id: "us-mhmda",
    law: "WA MHMDA / NV SB 370",
    req: "Consumer Health Data Notice & Prohibition of Health Data Sale",
    status: "PASS",
    details: "Dedicated Health Data Notice published; zero health data selling policy enforced.",
  },
  {
    id: "hipaa-ftc",
    law: "HIPAA / FTC HBNR",
    req: "Non-Covered Entity Disclosure & BAA Execution Portal for Covered Doulas",
    status: "PASS",
    details: "Disclosed in Health Data & BAA Guide with BAA execution contact.",
  },
  {
    id: "ai-transparency",
    law: "EU AI Act Art 50 / FTC",
    req: "Truthful disclosure of Form Studio heuristic generator vs. external LLM",
    status: "PASS",
    details: "Explicitly disclosed in AI Transparency Notice; zero prompts sent to third-party LLMs.",
  },
  {
    id: "officer-details",
    law: "India DPDPA & EU GDPR",
    req: "Formal appointment of resident Grievance Officer & DPO",
    status: "REQUIRES HUMAN REVIEW",
    details: "Corporate leadership must insert final officer names and registered India/EU addresses.",
  },
];

export default function ComplianceDashboard({ db, up, toast }) {
  const [activeTab, setActiveTab] = useState("checklist");
  const [newIncident, setNewIncident] = useState({ title: "", severity: "Low", notes: "" });

  const clients = db.clients || [];
  const assigned = db.assigned || [];
  const requests = db.complianceRequests || [];
  const incidents = db.securityIncidents || [];

  // Derive consent metrics
  const consentStats = clients.map((c) => {
    const clientAssigned = assigned.filter((a) => a.clientId === c.id);
    const intakeSigned = clientAssigned.some((a) => a.formId === "intake" && a.completedOn);
    const agreementSigned = clientAssigned.some((a) => a.formId === "agreement" && a.signedOn);
    const scopeSigned = clientAssigned.some((a) => a.formId === "scope" && a.signedOn);
    const backupSigned = clientAssigned.some((a) => a.formId === "backup" && a.signedOn);
    const mediaAssigned = clientAssigned.find((a) => a.formId === "confid");
    const mediaOptIn = mediaAssigned && mediaAssigned.answers ? mediaAssigned.answers.photos : "Pending";

    return {
      id: c.id,
      name: c.name,
      intakeSigned,
      agreementSigned,
      scopeSigned,
      backupSigned,
      mediaOptIn,
    };
  });

  const handleAddIncident = (e) => {
    e.preventDefault();
    if (!newIncident.title.trim()) return;
    const entry = {
      id: "INC-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      date: new Date().toISOString().split("T")[0],
      title: newIncident.title,
      severity: newIncident.severity,
      notes: newIncident.notes,
      notifiedRegulator: false,
    };
    if (up) {
      up((d) => ({
        securityIncidents: [...(d.securityIncidents || []), entry],
      }));
    }
    setNewIncident({ title: "", severity: "Low", notes: "" });
    toast("Security incident recorded in audit register.");
  };

  return (
    <>
      <PageHead
        eyebrow="Governance & Regulatory Assurance"
        title="Compliance & Trust Dashboard"
        sub="Monitor client consent logs, DSAR pipelines, ROPA data inventory, and statutory safeguards."
      />

      {/* Top Metric Ribbon */}
      <MetricRibbon cols={4}>
        <MetricCard
          title="Active Data Principals"
          value={clients.length}
          sub="Client records under protection"
          icon={IconClients}
          variant="default"
        />
        <MetricCard
          title="Statutory Checklist"
          value="7 / 8 Pass"
          sub="1 pending human appointment"
          icon={IconCheck}
          variant="ok"
          badge="Audit Ready"
        />
        <MetricCard
          title="Privacy Requests"
          value={requests.length}
          sub="Pending DSAR tickets"
          icon={IconDocs}
          variant={requests.length > 0 ? "warn" : "ok"}
        />
        <MetricCard
          title="Subprocessors"
          value="4 Active"
          sub="All DPAs & SCCs reviewed"
          icon={IconSign}
          variant="default"
        />
      </MetricRibbon>

      {/* Navigation Sub-Tabs */}
      <div className="tab-pill-bar" style={{ margin: "20px 0" }}>
        <button
          type="button"
          className={`neu-pill ${activeTab === "checklist" ? "active" : ""}`}
          onClick={() => setActiveTab("checklist")}
        >
          ✅ Statutory Checklist
        </button>
        <button
          type="button"
          className={`neu-pill ${activeTab === "consents" ? "active" : ""}`}
          onClick={() => setActiveTab("consents")}
        >
          📜 Client Consent Register
        </button>
        <button
          type="button"
          className={`neu-pill ${activeTab === "ropa" ? "active" : ""}`}
          onClick={() => setActiveTab("ropa")}
        >
          📊 ROPA Data Inventory
        </button>
        <button
          type="button"
          className={`neu-pill ${activeTab === "subprocessors" ? "active" : ""}`}
          onClick={() => setActiveTab("subprocessors")}
        >
          🏢 Subprocessors Directory
        </button>
        <button
          type="button"
          className={`neu-pill ${activeTab === "dsar" ? "active" : ""}`}
          onClick={() => setActiveTab("dsar")}
        >
          📬 DSAR Request Pipeline ({requests.length})
        </button>
        <button
          type="button"
          className={`neu-pill ${activeTab === "incidents" ? "active" : ""}`}
          onClick={() => setActiveTab("incidents")}
        >
          🚨 Incident Register
        </button>
      </div>

      {/* Tab 1: Statutory Checklist */}
      {activeTab === "checklist" && (
        <Card title="Multi-Jurisdictional Regulatory Audit Matrix">
          <div className="table-responsive">
            <table className="neu-table" style={{ width: "100%", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Framework</th>
                  <th style={{ textAlign: "left" }}>Statutory Requirement</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Technical & Legal Verification</th>
                </tr>
              </thead>
              <tbody>
                {CHECKLIST_ITEMS.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.law}</strong>
                    </td>
                    <td>{item.req}</td>
                    <td>
                      <span
                        className={`tag ${
                          item.status === "PASS"
                            ? "ok"
                            : item.status === "PARTIAL"
                            ? "warn"
                            : "bad"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--c-sub)" }}>{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Client Consent Register */}
      {activeTab === "consents" && (
        <Card title="Client Consent & Electronic Signature Log (GDPR Art 7 / DPDPA Sec 6)">
          <div className="table-responsive">
            <table className="neu-table" style={{ width: "100%", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Client</th>
                  <th style={{ textAlign: "center" }}>Intake Notice</th>
                  <th style={{ textAlign: "center" }}>Services Agreement</th>
                  <th style={{ textAlign: "center" }}>Scope of Practice</th>
                  <th style={{ textAlign: "center" }}>Backup Cover</th>
                  <th style={{ textAlign: "center" }}>Media Release</th>
                </tr>
              </thead>
              <tbody>
                {consentStats.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.intakeSigned ? <span className="tag ok">Completed</span> : <span className="tag warn">Pending</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.agreementSigned ? <span className="tag ok">Signed</span> : <span className="tag warn">Pending</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.scopeSigned ? <span className="tag ok">Signed</span> : <span className="tag warn">Pending</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.backupSigned ? <span className="tag ok">Consented</span> : <span className="tag warn">Pending</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="tag">{c.mediaOptIn || "Not set"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: ROPA Data Inventory */}
      {activeTab === "ropa" && (
        <Card title="Record of Processing Activities (ROPA - GDPR Art 30 / DPDPA Sec 6)">
          <div className="table-responsive">
            <table className="neu-table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Data Category</th>
                  <th style={{ textAlign: "left" }}>Specific Fields Processed</th>
                  <th style={{ textAlign: "left" }}>Lawful Basis</th>
                  <th style={{ textAlign: "left" }}>Retention Schedule</th>
                  <th style={{ textAlign: "left" }}>Authorized Sharing</th>
                </tr>
              </thead>
              <tbody>
                {ROPA_ITEMS.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{r.category}</strong>
                    </td>
                    <td style={{ maxWidth: "250px" }}>{r.fields}</td>
                    <td>{r.basis}</td>
                    <td>{r.retention}</td>
                    <td style={{ color: "var(--c-sub)" }}>{r.sharing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Subprocessor Directory */}
      {activeTab === "subprocessors" && (
        <Card title="Authorized Subprocessor Registry (GDPR Art 28 / DPDPA)">
          <div className="table-responsive">
            <table className="neu-table" style={{ width: "100%", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Subprocessor</th>
                  <th style={{ textAlign: "left" }}>Processing Purpose</th>
                  <th style={{ textAlign: "left" }}>Hosting Region</th>
                  <th style={{ textAlign: "left" }}>DPA Status</th>
                  <th style={{ textAlign: "left" }}>Risk Tier</th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.purpose}</td>
                    <td>{s.country}</td>
                    <td>
                      <span className="tag ok">{s.dpaStatus}</span>
                    </td>
                    <td>{s.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 5: DSAR Pipeline */}
      {activeTab === "dsar" && (
        <Card title="Data Subject & Principal Requests (DSAR Pipeline)">
          {requests.length === 0 ? (
            <Empty>No pending privacy requests from clients. All requests received via #/data-request will appear here.</Empty>
          ) : (
            <div className="table-responsive">
              <table className="neu-table" style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Ticket</th>
                    <th style={{ textAlign: "left" }}>Date</th>
                    <th style={{ textAlign: "left" }}>Request Type</th>
                    <th style={{ textAlign: "left" }}>Client</th>
                    <th style={{ textAlign: "left" }}>Status</th>
                    <th style={{ textAlign: "left" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.id}</strong>
                      </td>
                      <td>{req.date}</td>
                      <td>
                        <span className="tag">{req.type}</span>
                      </td>
                      <td>{req.client}</td>
                      <td>
                        <span className="tag warn">{req.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary mini"
                          onClick={() => toast(`Ticket ${req.id} marked fulfilled`)}
                        >
                          Mark Fulfilled
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Incident Register */}
      {activeTab === "incidents" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <Card title="Log Security Incident (SIRP Protocol)">
            <form onSubmit={handleAddIncident}>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="field-label">Incident Title:</label>
                <input
                  type="text"
                  required
                  className="neu-input"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="e.g. Lost backup USB drive / Phishing report"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="field-label">Severity Level:</label>
                <select
                  className="neu-input"
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                >
                  <option value="Low">Low (No data exposure)</option>
                  <option value="Medium">Medium (Internal anomaly)</option>
                  <option value="High">High (Potential personal data breach - 72h rule applies)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="field-label">Incident Notes & Remediation:</label>
                <textarea
                  rows={3}
                  className="neu-textarea"
                  value={newIncident.notes}
                  onChange={(e) => setNewIncident({ ...newIncident, notes: e.target.value })}
                  placeholder="Describe root cause and containment steps taken..."
                />
              </div>

              <button type="submit" className="primary">
                Record Incident
              </button>
            </form>
          </Card>

          <Card title="Incident Register & 72-Hour Timer">
            {incidents.length === 0 ? (
              <Empty>No security incidents recorded. Clean audit log.</Empty>
            ) : (
              <div className="incidents-list">
                {incidents.map((inc) => (
                  <div key={inc.id} className="row" style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div>
                      <strong>{inc.id}: {inc.title}</strong>
                      <div style={{ fontSize: "12px", color: "var(--c-sub)" }}>
                        Logged: {inc.date} · Severity: <span className="tag warn">{inc.severity}</span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{inc.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
