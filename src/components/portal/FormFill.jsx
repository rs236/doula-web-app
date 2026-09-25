import { useState, useEffect, useRef } from "react";
import { PageHead, Card } from "../ui.jsx";
import { today, fmt } from "../../lib/date.js";
import { kindOf, isRequired, canSubmitForm, formProgress } from "../../lib/formEngine.js";
import { exportFormToPdf } from "../../lib/pdfExport.js";
import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";

/** Fills in one client-facing form with luxury stepped progress and legal signature certificate. */
export default function FormFill({ up, a, form, back, toast, clientName = "Client", doulaEmail = "", portalToken = "" }) {
  const [ans, setAns] = useState(a.answers || {});
  const [exporting, setExporting] = useState(false);
  const locked = !!a.completedOn;
  const set = (k, v) => setAns((p) => ({ ...p, [k]: v }));

  // Autosave: every change lands in storage a moment after the person stops typing
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (locked) return;
    const t = setTimeout(() => {
      up((d) => ({ assigned: d.assigned.map((x) => (x.id === a.id ? { ...x, answers: ans } : x)) }));
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ans]);

  const canSubmit = canSubmitForm(form, ans);
  const { done, total } = formProgress(form, ans);
  const percentComplete = total > 0 ? Math.round((done / total) * 100) : 100;

  const handleDownloadPdf = () => {
    setExporting(true);
    try {
      exportFormToPdf({
        title: form.title,
        clientName: clientName,
        sections: form.sections || [],
        answers: ans,
        signedName: ans.__sig || a.signedName,
        signedAt: a.signedOn || a.completedOn || new Date().toISOString(),
        download: true,
      });
      toast("Official PDF downloaded");
    } catch (err) {
      console.error("PDF export error:", err);
      toast("Could not generate PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async () => {
    const isSigned = Boolean(form.sign && ans.__sig?.trim());
    const signedName = isSigned ? ans.__sig.trim() : null;
    const completionDate = today();

    // 1. If portal token and Supabase are active, call RPC
    if (isSupabaseConfigured && portalToken && a.dbId) {
      try {
        await supabase.rpc("submit_client_doc", {
          p_token: portalToken,
          p_doc_id: a.dbId,
          p_filled_data: ans,
          p_signed_name: signedName,
        });
      } catch (err) {
        console.warn("Supabase submit_client_doc fallback:", err);
      }
    }

    // 2. Update local/parent state
    up((d) => ({
      assigned: d.assigned.map((x) =>
        x.id === a.id
          ? {
              ...x,
              answers: ans,
              completedOn: completionDate,
              signedOn: isSigned ? completionDate : null,
              signedName,
            }
          : x
      ),
    }));

    // 3. Dispatch email notification to doula via serverless function
    if (doulaEmail) {
      try {
        fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: doulaEmail,
            portalToken: portalToken || c?.access_token || c?.accessToken,
            template: "document_completed",
            params: {
              clientName,
              formTitle: form.title,
            },
          }),
        }).catch((e) => console.log("Email notify skipped:", e));
      } catch (e) {
        // Non-blocking
      }
    }

    toast(isSigned ? "Signed and sent to your doula" : "Sent to your doula");
    back();
  };

  return (
    <>
      <button className="back" onClick={back}>
        ← Back to my forms
      </button>

      <PageHead
        eyebrow={form.category}
        title={form.title}
        sub={form.blurb || form.description}
      />

      {!locked && total > 0 && (
        <div className="form-progress-wrap">
          <div className="form-progress-header">
            <span>Progress: {done} of {total} fields answered</span>
            <b>{percentComplete}% Completed</b>
          </div>
          <div className="form-progress-bar">
            <div className="form-progress-fill" style={{ width: `${percentComplete}%` }} />
          </div>
        </div>
      )}

      {form.sections.map((sec) => (
        <Card title={sec.title} key={sec.id || sec.title} spotlight>
          {sec.fields.map((f) => {
            const kind = kindOf(f);
            const required = isRequired(f);
            return (
              <div className="fld" key={f.id}>
                {kind !== "consent" && (
                  <label htmlFor={f.id}>
                    {f.label}
                    {required && <span className="req">*</span>}
                  </label>
                )}
                {f.help && <p className="fieldhelp">{f.help}</p>}

                {kind === "text" && (
                  <input
                    id={f.id}
                    type="text"
                    disabled={locked}
                    value={ans[f.id] || ""}
                    onChange={(e) => set(f.id, e.target.value)}
                  />
                )}

                {kind === "initials" && (
                  <input
                    id={f.id}
                    type="text"
                    className="initialsfield"
                    maxLength={6}
                    disabled={locked}
                    value={ans[f.id] || ""}
                    onChange={(e) => set(f.id, e.target.value.toUpperCase())}
                    placeholder="Initials"
                  />
                )}

                {kind === "number" && (
                  <input
                    id={f.id}
                    type="number"
                    disabled={locked}
                    value={ans[f.id] ?? ""}
                    onChange={(e) => set(f.id, e.target.value === "" ? "" : Number(e.target.value))}
                  />
                )}

                {kind === "date" && (
                  <input
                    id={f.id}
                    type="date"
                    disabled={locked}
                    value={ans[f.id] || ""}
                    onChange={(e) => set(f.id, e.target.value)}
                  />
                )}

                {kind === "time" && (
                  <input
                    id={f.id}
                    type="time"
                    disabled={locked}
                    value={ans[f.id] || ""}
                    onChange={(e) => set(f.id, e.target.value)}
                  />
                )}

                {kind === "textarea" && (
                  <textarea
                    id={f.id}
                    rows={4}
                    disabled={locked}
                    value={ans[f.id] || ""}
                    onChange={(e) => set(f.id, e.target.value)}
                  />
                )}

                {kind === "select" && (
                  <select
                    id={f.id}
                    disabled={locked}
                    value={ans[f.id] || ""}
                    onChange={(e) => set(f.id, e.target.value)}
                  >
                    <option value="">Select an option...</option>
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {kind === "choice" && (
                  <div className="choicegroup">
                    {(f.options || []).map((opt) => {
                      const sel = ans[f.id] === opt;
                      return (
                        <button
                          key={opt}
                          disabled={locked}
                          type="button"
                          className={"choicebtn " + (sel ? "on" : "")}
                          onClick={() => set(f.id, opt)}
                        >
                          <span className="dot" />
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {kind === "multichoice" && (
                  <div className="choicegroup">
                    {(f.options || []).map((opt) => {
                      const cur = Array.isArray(ans[f.id]) ? ans[f.id] : [];
                      const sel = cur.includes(opt);
                      return (
                        <button
                          key={opt}
                          disabled={locked}
                          type="button"
                          className={"choicebtn multi " + (sel ? "on" : "")}
                          onClick={() => {
                            if (sel) set(f.id, cur.filter((x) => x !== opt));
                            else set(f.id, [...cur, opt]);
                          }}
                        >
                          <span className="box">{sel ? "✓" : ""}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {kind === "scale" && (
                  <div className="scale">
                    {Array.from({ length: f.max || 10 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        disabled={locked}
                        type="button"
                        className={"sc " + (ans[f.id] === n ? "on" : "")}
                        onClick={() => set(f.id, n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}

                {kind === "consent" && (
                  <button
                    disabled={locked}
                    type="button"
                    className={"checkline " + (ans[f.id] ? "on" : "")}
                    onClick={() => set(f.id, !ans[f.id])}
                  >
                    <span className="box">{ans[f.id] ? "✓" : ""}</span>
                    <span>{f.label}</span>
                  </button>
                )}

                {kind === "signature" && (
                  <input
                    id={f.id}
                    className="sigfield"
                    disabled={locked}
                    value={ans[f.id] || ""}
                    onChange={(e) => set(f.id, e.target.value)}
                    placeholder="Type your full name"
                  />
                )}
              </div>
            );
          })}
        </Card>
      ))}

      {form.sign && (
        <div className="cert-box">
          <div className="cert-header">
            <div className="cert-seal">⚖️</div>
            <div>
              <h3>Legal Signature Certificate</h3>
              <p>Type your full legal name below to execute this agreement.</p>
            </div>
          </div>
          <div className="fld" style={{ marginTop: 14 }}>
            <label htmlFor="sig">Full Legal Name</label>
            <input
              id="sig"
              className="sigfield"
              disabled={locked}
              value={ans.__sig || ""}
              onChange={(e) => set("__sig", e.target.value)}
              placeholder="e.g. Sarah Miller"
            />
          </div>
          {ans.__sig && (
            <div className="sig-preview-row">
              <span className="sig-preview-label">Digital Signature Preview:</span>
              <span className="sig-script-preview">{ans.__sig}</span>
            </div>
          )}
          <p className="hint">
            By typing your name and submitting, you acknowledge that this typed signature constitutes your legal consent under the ESIGN Act and state electronic signature laws.
          </p>
        </div>
      )}

      {!locked ? (
        <div className="actions" style={{ marginTop: 24 }}>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              up((d) => ({
                assigned: d.assigned.map((x) => (x.id === a.id ? { ...x, answers: ans } : x)),
              }));
              toast("Saved — you can return anytime");
            }}
          >
            Save progress
          </button>
          <button
            type="button"
            className="primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {form.sign ? "Sign and send" : "Send to my doula"}
          </button>
        </div>
      ) : (
        <div className="completed-doc-banner">
          <div className="completed-check-badge">✓</div>
          <div>
            <h3>Document Completed & Recorded</h3>
            <p>
              Submitted on {fmt(a.completedOn)}.
              {a.signedName && ` Digitally signed by ${a.signedName}.`}
            </p>
          </div>
          <button
            type="button"
            className="primary"
            style={{ marginLeft: "auto" }}
            onClick={handleDownloadPdf}
            disabled={exporting}
          >
            {exporting ? "Generating PDF..." : "📄 Download Official PDF"}
          </button>
        </div>
      )}
    </>
  );
}
