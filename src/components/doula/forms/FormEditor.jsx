import { Card, Field } from "../../ui.jsx";
import { makeField, makeSection } from "../../../lib/formEngine.js";
import FieldRow from "./FieldRow.jsx";

/** Controlled editor over a whole form object. The parent owns the form
    state (and decides when to persist it) — this component only ever
    calls onChange with the next full form. */
export default function FormEditor({ form, onChange }) {
  const set = (patch) => onChange({ ...form, ...patch, updatedOn: new Date().toISOString().slice(0, 10) });

  const updateSection = (sIdx, patch) => {
    const sections = form.sections.map((s, i) => (i === sIdx ? { ...s, ...patch } : s));
    set({ sections });
  };
  const removeSection = (sIdx) => set({ sections: form.sections.filter((_, i) => i !== sIdx) });
  const addSection = () => set({ sections: [...form.sections, makeSection("New section")] });

  const updateField = (sIdx, fIdx, nextField) => {
    const fields = form.sections[sIdx].fields.map((f, i) => (i === fIdx ? nextField : f));
    updateSection(sIdx, { fields });
  };
  const removeField = (sIdx, fIdx) => {
    updateSection(sIdx, { fields: form.sections[sIdx].fields.filter((_, i) => i !== fIdx) });
  };
  const duplicateField = (sIdx, fIdx) => {
    const original = form.sections[sIdx].fields[fIdx];
    const copy = { ...original, id: original.id + "-copy-" + Math.random().toString(36).slice(2, 6) };
    const fields = [...form.sections[sIdx].fields];
    fields.splice(fIdx + 1, 0, copy);
    updateSection(sIdx, { fields });
  };
  const moveField = (sIdx, fIdx, dir) => {
    const fields = [...form.sections[sIdx].fields];
    const j = fIdx + dir;
    if (j < 0 || j >= fields.length) return;
    [fields[fIdx], fields[j]] = [fields[j], fields[fIdx]];
    updateSection(sIdx, { fields });
  };
  const addField = (sIdx) => {
    updateSection(sIdx, { fields: [...form.sections[sIdx].fields, makeField("short_text")] });
  };

  return (
    <>
      <Card title="Form details">
        <div className="fgrid">
          <Field label="Title">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Description">
            <input value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </div>
        <label className="reqtoggle">
          <input type="checkbox" checked={!!form.sign} onChange={(e) => set({ sign: e.target.checked })} />
          Require a signature to submit this form
        </label>
      </Card>

      {form.sections.map((sec, sIdx) => (
        <Card key={sec.id} title={"Section " + (sIdx + 1)}>
          <div className="fld">
            <input
              className="sectiontitle"
              value={sec.title}
              onChange={(e) => updateSection(sIdx, { title: e.target.value })}
              placeholder="Section title"
            />
          </div>
          {sec.fields.map((f, fIdx) => (
            <FieldRow
              key={f.id}
              field={f}
              isFirst={fIdx === 0}
              isLast={fIdx === sec.fields.length - 1}
              onChange={(next) => updateField(sIdx, fIdx, next)}
              onDelete={() => removeField(sIdx, fIdx)}
              onDuplicate={() => duplicateField(sIdx, fIdx)}
              onMove={(dir) => moveField(sIdx, fIdx, dir)}
            />
          ))}
          <div className="actions" style={{ justifyContent: "space-between" }}>
            <button className="ghost" onClick={() => addField(sIdx)}>
              Add field
            </button>
            {form.sections.length > 1 && (
              <button className="ghost urgent" onClick={() => removeSection(sIdx)}>
                Remove section
              </button>
            )}
          </div>
        </Card>
      ))}

      <button className="ghost wide" onClick={addSection}>
        Add section
      </button>
    </>
  );
}
