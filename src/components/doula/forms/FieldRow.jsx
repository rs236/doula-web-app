import { FIELD_TYPES, fieldTypeMeta } from "../../../lib/formEngine.js";

/** One editable question inside the builder: label, type, required,
    help text, and — for choice types — its options list. */
export default function FieldRow({ field, onChange, onDelete, onDuplicate, onMove, isFirst, isLast }) {
  const meta = fieldTypeMeta(field.type);
  const set = (patch) => onChange({ ...field, ...patch });

  const setOption = (i, val) => {
    const next = [...field.options];
    next[i] = val;
    set({ options: next });
  };
  const addOption = () => set({ options: [...(field.options || []), "New option"] });
  const removeOption = (i) => set({ options: field.options.filter((_, idx) => idx !== i) });

  return (
    <div className="fieldrow">
      <div className="fieldrowtop">
        <input
          className="fieldlabel"
          value={field.label}
          onChange={(e) => set({ label: e.target.value })}
          placeholder="Question"
        />
        <select
          className="mini"
          value={field.type}
          onChange={(e) => {
            const nextMeta = fieldTypeMeta(e.target.value);
            set({
              type: e.target.value,
              options: nextMeta.hasOptions ? field.options && field.options.length ? field.options : ["Option 1", "Option 2"] : nextMeta.fixedOptions,
              max: e.target.value === "rating" ? field.max || 5 : undefined,
            });
          }}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <input
        className="fieldhelpinput"
        value={field.help || ""}
        onChange={(e) => set({ help: e.target.value })}
        placeholder="Help text (optional)"
      />

      {meta.hasOptions && (
        <div className="optioneditor">
          {(field.options || []).map((o, i) => (
            <div className="optionrow" key={i}>
              <input value={o} onChange={(e) => setOption(i, e.target.value)} />
              <button className="ghost" onClick={() => removeOption(i)} aria-label="Remove option">
                ✕
              </button>
            </div>
          ))}
          <button className="ghost" onClick={addOption}>
            Add option
          </button>
        </div>
      )}

      {field.type === "rating" && (
        <div className="fld">
          <label>Highest rating</label>
          <select className="mini" value={field.max || 5} onChange={(e) => set({ max: Number(e.target.value) })}>
            {[5, 10].map((n) => (
              <option key={n} value={n}>
                1–{n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="fieldrowfoot">
        <label className="reqtoggle">
          <input type="checkbox" checked={!!field.required} onChange={(e) => set({ required: e.target.checked })} />
          Required
        </label>
        <div className="fieldrowactions">
          <button className="ghost" disabled={isFirst} onClick={() => onMove(-1)} aria-label="Move up">
            ↑
          </button>
          <button className="ghost" disabled={isLast} onClick={() => onMove(1)} aria-label="Move down">
            ↓
          </button>
          <button className="ghost" onClick={onDuplicate}>
            Duplicate
          </button>
          <button className="ghost urgent" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
