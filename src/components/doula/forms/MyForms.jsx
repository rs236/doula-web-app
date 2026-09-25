import { useState } from "react";
import { Card, Empty } from "../../ui.jsx";
import { fmt } from "../../../lib/date.js";
import { sendCount } from "../../../lib/formEngine.js";

export default function MyForms({ db, onEdit, onPreview, onSend, onDuplicate, onArchive, onDelete, onCreate }) {
  const forms = db.customForms || [];

  return (
    <>
      {forms.length === 0 ? (
        <Card title="Your forms">
          <Empty>
            Nothing built yet. Use "Create with AI" for a starting point, or "Create manually" to build one
            from scratch.
          </Empty>
        </Card>
      ) : (
        <div className="cardgrid">
          {forms.map((f) => (
            <FormCard
              key={f.id}
              db={db}
              form={f}
              onEdit={() => onEdit(f)}
              onPreview={() => onPreview(f)}
              onSend={onSend}
              onDuplicate={() => onDuplicate(f)}
              onArchive={() => onArchive(f)}
              onDelete={() => onDelete(f)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FormCard({ db, form, onEdit, onPreview, onSend, onDuplicate, onArchive, onDelete }) {
  const [sending, setSending] = useState(false);
  const [clientId, setClientId] = useState(db.clients[0] ? db.clients[0].id : "");
  const fieldCount = form.sections.reduce((n, s) => n + s.fields.length, 0);
  const sentTo = sendCount(db, form.id);

  return (
    <div className="doccard formcard">
      <div className="cchead">
        <span className={"eyebrow " + (form.source === "ai" ? "aitag" : "")}>
          {form.source === "ai" ? "AI-generated" : "Custom"}
        </span>
        <span className={"tag " + (form.status === "active" ? "ok" : form.status === "archived" ? "bad" : "")}>
          {form.status}
        </span>
      </div>
      <b>{form.title}</b>
      <p>{form.description}</p>
      <div className="formmeta">
        {fieldCount} field{fieldCount === 1 ? "" : "s"} · created {fmt(form.createdOn)} · sent to {sentTo}{" "}
        client{sentTo === 1 ? "" : "s"}
      </div>

      <div className="formcardactions">
        <button className="ghost" onClick={onEdit}>
          Edit
        </button>
        <button className="ghost" onClick={onPreview}>
          Preview
        </button>
        <button className="ghost" onClick={onDuplicate}>
          Duplicate
        </button>
        {form.status !== "archived" && (
          <button className="ghost" onClick={onArchive}>
            Archive
          </button>
        )}
        <button className="ghost urgent" onClick={onDelete}>
          Delete
        </button>
      </div>

      {form.status === "active" && (
        <div className="sendbox">
          {sending ? (
            <div className="sendrow">
              <select className="mini wide" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {db.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="actions">
                <button className="ghost" onClick={() => setSending(false)}>
                  Cancel
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    onSend(form, clientId);
                    setSending(false);
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <button className="ghost wide" onClick={() => setSending(true)}>
              Send to client
            </button>
          )}
        </div>
      )}
    </div>
  );
}
