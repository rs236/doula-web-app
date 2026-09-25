import { useState } from "react";
import { PageHead } from "../ui.jsx";
import { today, uid } from "../../lib/date.js";
import { makeForm } from "../../lib/formEngine.js";
import { generateFormFromPrompt } from "../../lib/aiFormGen.js";
import MyForms from "./forms/MyForms.jsx";
import AIFormGenerator from "./forms/AIFormGenerator.jsx";
import FormEditor from "./forms/FormEditor.jsx";
import FormPreview from "./forms/FormPreview.jsx";

/* view: "library" | "ai" | "editor" | "preview" */
export default function FormStudio({ db, up, toast }) {
  const [view, setView] = useState("library");
  const [draft, setDraft] = useState(null);
  const [draftPrompt, setDraftPrompt] = useState(null);
  const [isNew, setIsNew] = useState(true);

  const openLibrary = () => {
    setView("library");
    setDraft(null);
    setDraftPrompt(null);
  };

  const startManual = () => {
    setDraft(makeForm());
    setDraftPrompt(null);
    setIsNew(true);
    setView("editor");
  };

  const startFromAI = (form, prompt) => {
    setDraft(form);
    setDraftPrompt(prompt);
    setIsNew(true);
    setView("editor");
  };

  const editExisting = (form) => {
    setDraft(form);
    setDraftPrompt(null);
    setIsNew(false);
    setView("editor");
  };

  const regenerate = () => {
    if (!draftPrompt) return;
    const fresh = generateFormFromPrompt(draftPrompt);
    setDraft({ ...fresh, id: draft.id });
  };

  const saveDraft = (status) => {
    if (!draft.title.trim()) return toast("Give the form a title first");
    const stamped = { ...draft, status, updatedOn: today() };
    up((d) => {
      const exists = (d.customForms || []).some((f) => f.id === stamped.id);
      return {
        customForms: exists
          ? d.customForms.map((f) => (f.id === stamped.id ? stamped : f))
          : [...(d.customForms || []), stamped],
      };
    });
    toast(status === "draft" ? "Saved as draft" : "Saved to My Forms");
    openLibrary();
  };

  const duplicateForm = (form) => {
    const copy = {
      ...form,
      id: uid(),
      title: form.title + " (copy)",
      status: "draft",
      createdOn: today(),
      updatedOn: today(),
    };
    up((d) => ({ customForms: [...(d.customForms || []), copy] }));
    toast("Duplicated — find it in My Forms as a draft");
  };

  const archiveForm = (form) => {
    up((d) => ({
      customForms: d.customForms.map((f) => (f.id === form.id ? { ...f, status: "archived" } : f)),
    }));
    toast(form.title + " archived");
  };

  const deleteForm = (form) => {
    const inUse = db.assigned.some((a) => a.formId === form.id);
    if (inUse) return toast("Can't delete — this form has been sent to a client");
    up((d) => ({ customForms: d.customForms.filter((f) => f.id !== form.id) }));
    toast(form.title + " deleted");
  };

  const sendForm = (form, clientId) => {
    if (!clientId) return toast("Choose a client first");
    up((d) => ({
      assigned: [
        ...d.assigned,
        { id: uid(), clientId, formId: form.id, sentOn: today(), answers: {}, signedOn: null, completedOn: null },
      ],
    }));
    const client = db.clients.find((c) => c.id === clientId);
    toast(form.title + " sent" + (client ? " to " + client.name : ""));
  };

  if (view === "ai")
    return (
      <>
        <button className="back" onClick={openLibrary}>
          ← Form Studio
        </button>
        <AIFormGenerator onGenerated={(form, prompt) => startFromAI(form, prompt)} />
      </>
    );

  if (view === "editor" && draft)
    return (
      <>
        <button className="back" onClick={openLibrary}>
          ← Form Studio
        </button>
        <PageHead
          eyebrow={draft.source === "ai" ? "Generated draft — review before saving" : isNew ? "New form" : "Editing"}
          title={draft.title || "Untitled form"}
          sub="Add fields, mark what's required, and preview it the way your client will see it."
        />
        <div className="actions" style={{ justifyContent: "flex-start", marginBottom: 16 }}>
          {draftPrompt && (
            <button className="ghost" onClick={regenerate}>
              Regenerate
            </button>
          )}
          <button className="ghost" onClick={() => setView("preview")}>
            Preview
          </button>
        </div>
        <FormEditor form={draft} onChange={setDraft} />
        <div className="actions">
          <button className="ghost" onClick={() => saveDraft("draft")}>
            Save as draft
          </button>
          <button className="primary" onClick={() => saveDraft("active")}>
            Save to My Forms
          </button>
        </div>
      </>
    );

  if (view === "preview" && draft)
    return (
      <>
        <button className="back" onClick={() => setView("editor")}>
          ← Back to editor
        </button>
        <FormPreview form={draft} />
      </>
    );

  return (
    <>
      <PageHead
        eyebrow="Beyond the standard packet"
        title="Form Studio"
        sub="Build custom forms for the visits and check-ins the packet doesn't cover."
      />
      <div className="actions" style={{ justifyContent: "flex-start", marginBottom: 18 }}>
        <button className="primary" onClick={() => setView("ai")}>
          Create with AI
        </button>
        <button className="ghost" onClick={startManual}>
          Create manually
        </button>
      </div>
      <MyForms
        db={db}
        onEdit={editExisting}
        onPreview={(f) => {
          setDraft(f);
          setView("preview");
        }}
        onSend={sendForm}
        onDuplicate={duplicateForm}
        onArchive={archiveForm}
        onDelete={deleteForm}
      />
    </>
  );
}
