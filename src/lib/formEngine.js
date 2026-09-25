/* Generic form engine.
   Every form — the seven built-in packet documents and anything a doula
   builds herself — is: Form -> Sections -> Fields -> (client) Response.
   This file is the one place that knows what a field type means. */

import { uid, today } from "./date.js";
import { formById as staticFormById } from "../data/forms.js";

/* The field palette. `kind` tells the renderer which primitive input to
   draw; several rich types share one primitive (yesno/multiple_choice
   both render as radio buttons, for instance). */
export const FIELD_TYPES = [
  { type: "short_text", label: "Short text", kind: "text", hasOptions: false },
  { type: "long_text", label: "Long text", kind: "textarea", hasOptions: false },
  { type: "yesno", label: "Yes / No", kind: "radio", hasOptions: false, fixedOptions: ["Yes", "No"] },
  { type: "multiple_choice", label: "Multiple choice", kind: "radio", hasOptions: true },
  { type: "checkboxes", label: "Checkboxes", kind: "multi", hasOptions: true },
  { type: "dropdown", label: "Dropdown", kind: "select", hasOptions: true },
  { type: "date", label: "Date", kind: "date", hasOptions: false },
  { type: "time", label: "Time", kind: "time", hasOptions: false },
  { type: "number", label: "Number", kind: "number", hasOptions: false },
  { type: "rating", label: "Rating", kind: "scale", hasOptions: false },
  { type: "signature", label: "Signature", kind: "signature", hasOptions: false },
  { type: "initials", label: "Initials", kind: "initials", hasOptions: false },
  { type: "consent", label: "Consent checkbox", kind: "consent", hasOptions: false },
];
export const fieldTypeMeta = (type) => FIELD_TYPES.find((f) => f.type === type) || FIELD_TYPES[0];

/* Legacy adapter: the seven built-in packet forms were written before this
   engine, with a smaller vocabulary (text/tel/date/textarea/select/radio/
   multi/scale/check). Map them onto the same render "kind" so one renderer
   handles both without touching the built-in form data. */
const LEGACY_KIND = {
  text: "text",
  tel: "text",
  date: "date",
  textarea: "textarea",
  select: "select",
  radio: "radio",
  multi: "multi",
  scale: "scale",
  check: "consent",
};
export function kindOf(field) {
  if (field.kind) return field.kind;
  const meta = FIELD_TYPES.find((f) => f.type === field.type);
  if (meta) return meta.kind;
  return LEGACY_KIND[field.type] || "text";
}
/** A field is required if it says so explicitly, or is a legacy checkbox
    (the old vocabulary used "check" to mean "must tick to proceed"). */
export function isRequired(field) {
  if (typeof field.required === "boolean") return field.required;
  return field.type === "check" || field.type === "consent" || field.type === "signature";
}

export function makeField(type = "short_text") {
  const meta = fieldTypeMeta(type);
  return {
    id: uid(),
    type,
    label: meta.type === "consent" ? "I consent to the above" : "Untitled question",
    help: "",
    required: type === "consent" || type === "signature",
    options: meta.hasOptions ? ["Option 1", "Option 2"] : meta.fixedOptions || undefined,
    max: type === "rating" ? 5 : undefined,
  };
}
export function makeSection(title = "New section", fields = []) {
  return { id: uid(), title, fields };
}
export function makeForm({ title = "Untitled form", description = "", sign = false } = {}) {
  return {
    id: uid(),
    title,
    description,
    category: "Custom",
    sign,
    status: "draft", // draft | active | archived
    source: "manual", // manual | ai
    createdOn: today(),
    updatedOn: today(),
    sections: [makeSection("Section 1")],
  };
}

/* ---------- lookups ---------- */

/** Find a form by id across the built-in packet and the doula's own library.
    The seven packet documents always exist; a client form's own id wins if
    it collides, which it shouldn't since custom form ids come from uid(). */
export function resolveForm(db, formId) {
  return staticFormById(formId) || (db.customForms || []).find((f) => f.id === formId) || null;
}

/** How many client-forms (assignments) reference a given form definition. */
export function sendCount(db, formId) {
  return db.assigned.filter((a) => a.formId === formId).length;
}

/* ---------- assignment status ---------- */

export const STATUS_ORDER = ["Sent", "Opened", "In progress", "Completed", "Signed", "Expired"];

export function assignmentStatus(a, form) {
  if (a.expiresOn && !a.completedOn && a.expiresOn < today()) return "Expired";
  if (a.completedOn) {
    if (form && form.sign) return a.signedOn ? "Signed" : "Completed";
    return "Completed";
  }
  if (a.answers && Object.keys(a.answers).some((k) => k !== "__sig" && answered(a.answers[k])))
    return "In progress";
  if (a.openedOn) return "Opened";
  return "Sent";
}

function answered(v) {
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && v !== "";
}

/* ---------- validation + progress, shared by preview and the real fill ---------- */

export function allFields(form) {
  return (form.sections || []).flatMap((s) => s.fields);
}

export function fieldAnswered(field, answers) {
  return answered(answers[field.id]);
}

export function formProgress(form, answers) {
  const fields = allFields(form).filter((f) => kindOf(f) !== "signature");
  const done = fields.filter((f) => fieldAnswered(f, answers)).length;
  return { done, total: fields.length };
}

export function canSubmitForm(form, answers) {
  const required = allFields(form).filter(isRequired);
  const requiredOk = required.every((f) => fieldAnswered(f, answers));
  const signedOk = !form.sign || (answers.__sig || "").trim().length > 1;
  return requiredOk && signedOk;
}
