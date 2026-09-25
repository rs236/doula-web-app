import { useState } from "react";
import { PageHead, Card, Empty } from "../ui.jsx";
import { IconCheck, IconClose, IconDocs, IconClients, IconSign } from "../icons.jsx";

export default function DataRequestPortal({ db, up, toast, activeClient, onBack }) {
  const [requestType, setRequestType] = useState("export");
  const [clientIdentifier, setClientIdentifier] = useState(activeClient ? activeClient.name : "");
  const [clientEmail, setClientEmail] = useState("");
  const [details, setDetails] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeContact, setNomineeContact] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [exportJson, setExportJson] = useState(null);

  const handleExportData = () => {
    // Look up client either by activeClient or by name/email match
    const client =
      activeClient ||
      db.clients.find(
        (c) =>
          c.name.toLowerCase() === clientIdentifier.trim().toLowerCase() ||
          (c.phone && c.phone.includes(clientIdentifier.trim()))
      );

    if (!client) {
      toast("Client record not found. Please verify the client name or ID.");
      return;
    }

    const clientForms = (db.assigned || []).filter((a) => a.clientId === client.id);
    const clientAppts = (db.appts || []).filter((a) => a.clientId === client.id);
    const clientInvoices = (db.payments || []).filter((p) => p.clientId === client.id);
    const clientLogs = (db.logs || []).filter((l) => l.clientId === client.id);
    const clientCheckins = (db.checkins || []).filter((k) => k.clientId === client.id);

    const fullExportPackage = {
      exportMetadata: {
        platform: "MaternalSupportCo Hub",
        generatedAt: new Date().toISOString(),
        requestType: "GDPR Article 15 / DPDPA Section 11 Data Portability Package",
        jurisdiction: "Multi-Jurisdictional Machine-Readable Export",
      },
      clientProfile: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        estimatedDueDate: client.edd,
        status: client.status,
        careProvider: client.provider,
        plannedBirthplace: client.birthplace,
        supportPackage: client.package,
        partner: client.partner,
        emergencyContact: client.emergency,
      },
      assignedDocuments: clientForms,
      scheduledAppointments: clientAppts,
      financialRecords: clientInvoices,
      birthLogEvents: clientLogs,
      postpartumWellnessPulses: clientCheckins,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullExportPackage, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `msc_client_archive_${client.name.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportJson(fullExportPackage);
    toast("Client Data Package downloaded successfully!");
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!clientIdentifier.trim()) {
      toast("Please provide your name or client reference.");
      return;
    }

    const ticketId = "REQ-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const newRequest = {
      id: ticketId,
      date: new Date().toISOString().split("T")[0],
      type: requestType,
      client: clientIdentifier,
      email: clientEmail,
      details,
      nominee: requestType === "nominee" ? { name: nomineeName, contact: nomineeContact } : null,
      status: "Pending Review",
    };

    if (up) {
      up((d) => ({
        complianceRequests: [...(d.complianceRequests || []), newRequest],
      }));
    }

    setSubmittedTicket(newRequest);
    toast(`Request registered! Ticket ID: ${ticketId}`);
  };

  return (
    <div className="legal-portal-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <PageHead
          eyebrow="Privacy & Data Governance"
          title="Data Subject & Principal Rights Portal"
          sub="Exercise your statutory rights under GDPR, India DPDPA 2023, and US Privacy Laws."
        />
        {onBack && (
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>

      <div className="dsar-grid">
        <Card title="1. Select Your Statutory Request">
          <div className="dsar-type-picker">
            <button
              type="button"
              className={`neu-pill ${requestType === "export" ? "active" : ""}`}
              onClick={() => {
                setRequestType("export");
                setSubmittedTicket(null);
              }}
            >
              📦 Data Export (Portability)
            </button>
            <button
              type="button"
              className={`neu-pill ${requestType === "erasure" ? "active" : ""}`}
              onClick={() => {
                setRequestType("erasure");
                setSubmittedTicket(null);
              }}
            >
              🗑️ Right to Erasure
            </button>
            <button
              type="button"
              className={`neu-pill ${requestType === "rectification" ? "active" : ""}`}
              onClick={() => {
                setRequestType("rectification");
                setSubmittedTicket(null);
              }}
            >
              ✏️ Rectification / Correction
            </button>
            <button
              type="button"
              className={`neu-pill ${requestType === "nominee" ? "active" : ""}`}
              onClick={() => {
                setRequestType("nominee");
                setSubmittedTicket(null);
              }}
            >
              👤 DPDPA Nominee Designation
            </button>
            <button
              type="button"
              className={`neu-pill ${requestType === "grievance" ? "active" : ""}`}
              onClick={() => {
                setRequestType("grievance");
                setSubmittedTicket(null);
              }}
            >
              ⚖️ DPDPA Grievance / Complaint
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            {requestType === "export" && (
              <div className="dsar-explainer">
                <p>
                  <strong>GDPR Article 15 & DPDPA Section 11:</strong> You have the right to receive a complete,
                  machine-readable archive of all personal information, signed intakes, birth plan preferences,
                  labor notes, and invoices stored in this practice.
                </p>
                <div style={{ marginTop: "16px" }}>
                  <label className="field-label">Client Name or Reference:</label>
                  <input
                    type="text"
                    className="neu-input"
                    value={clientIdentifier}
                    onChange={(e) => setClientIdentifier(e.target.value)}
                    placeholder="e.g. Priya Menon"
                    style={{ width: "100%", marginBottom: "14px" }}
                  />
                  <button type="button" className="primary" onClick={handleExportData}>
                    ⬇️ Download Complete Client Archive (.JSON)
                  </button>
                </div>
              </div>
            )}

            {requestType !== "export" && !submittedTicket && (
              <form onSubmit={handleSubmitRequest} className="dsar-form">
                <div className="form-group">
                  <label className="field-label">Your Full Name:</label>
                  <input
                    type="text"
                    required
                    className="neu-input"
                    value={clientIdentifier}
                    onChange={(e) => setClientIdentifier(e.target.value)}
                    placeholder="Full Legal Name"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Contact Email / Phone:</label>
                  <input
                    type="text"
                    required
                    className="neu-input"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="email@example.com or phone number"
                  />
                </div>

                {requestType === "nominee" && (
                  <div className="nominee-fields" style={{ background: "rgba(0,0,0,0.02)", padding: "14px", borderRadius: "12px", marginBottom: "14px" }}>
                    <div className="form-group">
                      <label className="field-label">Designated Nominee Name (DPDPA Sec 14):</label>
                      <input
                        type="text"
                        required
                        className="neu-input"
                        value={nomineeName}
                        onChange={(e) => setNomineeName(e.target.value)}
                        placeholder="Name of trusted partner / individual"
                      />
                    </div>
                    <div className="form-group">
                      <label className="field-label">Nominee Contact (Email / Phone):</label>
                      <input
                        type="text"
                        required
                        className="neu-input"
                        value={nomineeContact}
                        onChange={(e) => setNomineeContact(e.target.value)}
                        placeholder="Nominee contact details"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="field-label">
                    {requestType === "erasure"
                      ? "Reason or scope of erasure request:"
                      : requestType === "rectification"
                      ? "Fields to correct (e.g. due date, contact info):"
                      : "Grievance details & desired remedy:"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="neu-textarea"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide details to assist your doula and data protection officer..."
                  />
                </div>

                <button type="submit" className="primary" style={{ marginTop: "12px" }}>
                  Submit Statutory Request
                </button>
              </form>
            )}

            {submittedTicket && (
              <div className="ticket-success neu-card" style={{ padding: "20px", marginTop: "16px", borderLeft: "4px solid #4CAF50" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <IconCheck />
                  <h4 style={{ margin: 0 }}>Statutory Request Registered</h4>
                </div>
                <p style={{ margin: "10px 0" }}>
                  Your request has been logged and assigned ticket <strong>{submittedTicket.id}</strong>.
                </p>
                <div style={{ fontSize: "13px", color: "var(--c-sub)" }}>
                  • Acknowledged within: <strong>48 hours</strong>
                  <br />
                  • Statutory SLA: <strong>30 calendar days</strong> under GDPR Article 12 / DPDPA Section 13.
                  <br />
                  • Escalation: You may also email <strong>grievance@maternalsupport.co</strong> quoting this ticket ID.
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="2. Regulatory Notice & Rights Framework">
          <div className="rights-reference-list" style={{ fontSize: "14px", lineHeight: "1.6" }}>
            <div className="rights-item" style={{ marginBottom: "14px" }}>
              <strong>🇮🇳 India DPDPA, 2023</strong>
              <p style={{ margin: "4px 0", color: "var(--c-sub)" }}>
                Sections 11–14 empower Data Principals with rights of access, correction, erasure, nomination, and
                statutory grievance redressal with right of appeal to the Data Protection Board of India.
              </p>
            </div>

            <div className="rights-item" style={{ marginBottom: "14px" }}>
              <strong>🇪🇺 European Union GDPR</strong>
              <p style={{ margin: "4px 0", color: "var(--c-sub)" }}>
                Articles 15–22 provide comprehensive rights of access, rectification, erasure (right to be forgotten),
                restriction, portability, and objection without adverse financial penalty.
              </p>
            </div>

            <div className="rights-item" style={{ marginBottom: "14px" }}>
              <strong>🇺🇸 US State Health & Privacy Laws</strong>
              <p style={{ margin: "4px 0", color: "var(--c-sub)" }}>
                Washington MHMDA (RCW 19.373) and California CCPA/CPRA grant immediate rights to delete sensitive consumer
                health and reproductive data, with zero behavioral advertising cross-selling.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
