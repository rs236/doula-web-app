import { PageHead, Card } from "../../ui.jsx";
import { kindOf, isRequired } from "../../../lib/formEngine.js";

/** What the client will see, rendered read-only so the doula can check it
    before sending. Deliberately not wired to state — nothing here is
    ever saved. */
export default function FormPreview({ form }) {
  return (
    <>
      <PageHead eyebrow={"Preview · " + form.category} title={form.title} sub={form.description} />
      {form.sections.map((sec) => (
        <Card title={sec.title} key={sec.id || sec.title}>
          {sec.fields.map((f) => {
            const kind = kindOf(f);
            return (
              <div className="fld" key={f.id}>
                {kind !== "consent" && (
                  <label>
                    {f.label}
                    {isRequired(f) && <span className="req">*</span>}
                  </label>
                )}
                {f.help && <p className="fieldhelp">{f.help}</p>}
                <PreviewInput kind={kind} field={f} />
              </div>
            );
          })}
        </Card>
      ))}
      {form.sign && (
        <Card title="Signature">
          <input className="sigfield" disabled placeholder="Client types their full name here" />
        </Card>
      )}
    </>
  );
}

function PreviewInput({ kind, field }) {
  switch (kind) {
    case "textarea":
      return <textarea disabled placeholder="Client's answer" />;
    case "select":
      return (
        <select disabled>
          <option>Choose…</option>
          {(field.options || []).map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    case "radio":
    case "multi":
      return (
        <div className="opts">
          {(field.options || []).map((o) => (
            <button key={o} className="opt" disabled>
              {o}
            </button>
          ))}
        </div>
      );
    case "scale":
      return (
        <div className="scale">
          {Array.from({ length: field.max || 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} className="sc" disabled>
              {n}
            </button>
          ))}
        </div>
      );
    case "consent":
      return (
        <button className="checkline" disabled>
          <span className="box" />
          {field.label}
        </button>
      );
    case "signature":
      return <input className="sigfield" disabled placeholder="Client signs here" />;
    case "number":
      return <input type="number" disabled placeholder="0" />;
    case "time":
      return <input type="time" disabled />;
    case "date":
      return <input type="date" disabled />;
    default:
      return <input disabled placeholder="Client's answer" />;
  }
}
