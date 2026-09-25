import { useEffect } from "react";
import { PageHead, Empty } from "../ui.jsx";
import { resolveForm, assignmentStatus, formProgress } from "../../lib/formEngine.js";
import { today } from "../../lib/date.js";
import FormFill from "./FormFill.jsx";

const STATUS_CLASS = {
  Completed: "ok",
  Signed: "ok",
  "In progress": "",
  Opened: "",
  Sent: "",
  Expired: "bad",
};

export default function PortalForms({ db, up, c, openForm, setOpenForm, toast }) {
  const mine = db.assigned.filter((a) => a.clientId === c.id);
  const a = openForm ? db.assigned.find((x) => x.id === openForm) : null;
  const activeForm = a ? resolveForm(db, a.formId) : null;

  // Opening a form the client hasn't looked at yet stamps when they did —
  // feeds the doula's status view without any extra action from her.
  useEffect(() => {
    if (a && !a.openedOn && !a.completedOn) {
      up((d) => ({
        assigned: d.assigned.map((x) => (x.id === a.id ? { ...x, openedOn: today() } : x)),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a && a.id]);

  if (a && activeForm && a.clientId === c.id) {
    return (
      <FormFill
        db={db}
        up={up}
        a={a}
        form={activeForm}
        back={() => setOpenForm(null)}
        toast={toast}
        clientName={c?.name || "Client"}
        portalToken={c?.accessToken || c?.access_token || c?.id}
      />
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Paperwork"
        title="My forms"
        sub="Save as you go. Nothing is sent until you press send."
      />
      {mine.length === 0 && <Empty>Your doula hasn't sent anything yet.</Empty>}
      <div className="cardgrid">
        {mine.map((x) => {
          const f = resolveForm(db, x.formId);
          if (!f) return null;
          const status = assignmentStatus(x, f);
          const { done, total } = formProgress(f, x.answers || {});
          return (
            <div className="doccard" key={x.id}>
              <div className="eyebrow">{f.category}</div>
              <b>{f.title}</b>
              <p>{f.blurb || f.description}</p>
              {status === "In progress" && <p className="hint">{done} of {total} fields completed</p>}
              <div className="docfoot">
                <span className={"tag " + (STATUS_CLASS[status] || "")}>{status}</span>
                <button className="ghost" onClick={() => setOpenForm(x.id)}>
                  {x.completedOn ? "Review" : status === "Sent" ? "Fill in" : "Continue"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
