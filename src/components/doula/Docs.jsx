import { useState } from "react";
import { PageHead, Card, Empty, KV } from "../ui.jsx";
import { today, fmt, uid } from "../../lib/date.js";
import { FORMS } from "../../data/forms.js";
import { resolveForm, assignmentStatus } from "../../lib/formEngine.js";
import { renderVal } from "../../lib/derive.js";
import { exportFormToPdf } from "../../lib/pdfExport.js";

const STATUS_CLASS = {
  Completed: "ok",
  Signed: "ok",
  "In progress": "",
  Opened: "",
  Sent: "",
  Expired: "bad",
};

export default function Docs({ db, up, toast }) {
  const [clientId, setClientId] = useState(db.clients[0] ? db.clients[0].id : "");
  const [viewing, setViewing] = useState(null);

  const mine = db.assigned.filter((a) => a.clientId === clientId);
  const a = viewing ? db.assigned.find((x) => x.id === viewing) : null;
  const library = [...FORMS, ...(db.customForms || []).filter((f) => f.status !== "archived")];

  if (a) {
    const form = resolveForm(db, a.formId);
    const client = db.clients.find((c) => c.id === a.clientId);
    const status = assignmentStatus(a, form);

    const downloadPdf = () => {
      exportFormToPdf({
        title: form.title,
        clientName: client ? client.name : "Client",
        sections: form.sections || [],
        answers: a.answers || {},
        signedName: a.signedName || a.answers?.__sig,
        signedAt: a.signedOn || a.completedOn,
        download: true,
      });
      toast("PDF downloaded");
    };

    return (
      <>
        <button className="back noprint" onClick={() => setViewing(null)}>
          ← Documents
        </button>
        <PageHead
          eyebrow={client ? client.name : ""}
          title={form.title}
          sub={a.completedOn ? "Completed " + fmt(a.completedOn) : status}
        />
        <Card title="Responses">
          <p className="printonly">
            <b>{form.title}</b> — {client ? client.name : ""} — {a.completedOn ? fmt(a.completedOn) : status}
          </p>
          {!a.completedOn && <Empty>Nothing submitted yet. The client sees this in their portal.</Empty>}
          {a.completedOn &&
            form.sections.map((sec) => (
              <div key={sec.id || sec.title} className="respsec">
                <div className="eyebrow">{sec.title}</div>
                {sec.fields.map((fl) => (
                  <KV key={fl.id} k={fl.label} v={renderVal(a.answers[fl.id])} />
                ))}
              </div>
            ))}
          {a.signedOn && (
            <div className="signblock">
              Signed by {a.answers.__sig || "client"} on {fmt(a.signedOn)} · audit id {a.id}
            </div>
          )}
          {a.completedOn && (
            <div className="actions noprint">
              <button className="ghost" onClick={downloadPdf}>
                📄 Download PDF
              </button>
              <button className="ghost" onClick={() => window.print()}>
                Print
              </button>
            </div>
          )}
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Client packet"
        title="Documents"
        sub="Assign, track, and read everything the client returns — the standard packet plus anything built in Form Studio."
      />
      <div className="pickrow">
        <select className="mini" aria-label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {db.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="hint">
          {mine.filter((x) => x.completedOn).length}/{mine.length} returned
        </span>
      </div>

      <div className="cardgrid">
        {library.map((f) => {
          const asg = mine.find((x) => x.formId === f.id);
          const status = asg ? assignmentStatus(asg, f) : null;
          return (
            <div className="doccard" key={f.id}>
              <div className="eyebrow">{f.category}</div>
              <b>{f.title}</b>
              <p>{f.blurb || f.description}</p>
              {asg ? (
                <div className="docfoot">
                  <span className={"tag " + (STATUS_CLASS[status] || "")}>{status}</span>
                  <button className="ghost" onClick={() => setViewing(asg.id)}>
                    View
                  </button>
                </div>
              ) : (
                <button
                  className="ghost wide"
                  disabled={!clientId}
                  onClick={() => {
                    up((d) => ({
                      assigned: [
                        ...d.assigned,
                        { id: uid(), clientId, formId: f.id, sentOn: today(), answers: {}, signedOn: null, completedOn: null },
                      ],
                    }));
                    toast(f.title + " sent");
                  }}
                >
                  Send to client
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
