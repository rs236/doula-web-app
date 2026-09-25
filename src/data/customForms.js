import { addDays, today, uid } from "../lib/date.js";
import { makeForm, makeSection, makeField } from "../lib/formEngine.js";
import { generateFormFromPrompt } from "../lib/aiFormGen.js";

const f = (type, label, extra = {}) => ({ ...makeField(type), label, ...extra });

/** Custom forms + the client assignments that reference them, built
    together so the demo answers line up with real field ids. Gives
    Form Studio and the status views something to show on first load:
    one manually-built form (completed), one AI-generated form
    (in progress) — matching the example status table in the brief. */
export function seedFormStudio() {
  const t = today();

  const homeSafety = makeForm({
    title: "Home Safety & Support Check",
    description: "A short check on household support ahead of the on-call window.",
    sign: false,
  });
  homeSafety.id = "cf-home-safety";
  homeSafety.status = "active";
  homeSafety.source = "manual";
  homeSafety.createdOn = addDays(t, -14);
  homeSafety.updatedOn = addDays(t, -14);
  const supportField = {
    ...f("checkboxes", "What's arranged so far", {
      options: ["Meals for the first week", "Help with older children", "Someone checking in daily", "Ride to the hospital or birth centre"],
    }),
    id: "sf-support",
  };
  const notesField = { ...f("long_text", "Anything you're still figuring out", { required: false }), id: "sf-notes" };
  const carseatField = { ...f("yesno", "Do you have a car seat installed and checked?"), id: "sf-carseat" };
  homeSafety.sections = [makeSection("Support in place", [supportField, notesField, carseatField])];

  const breastfeeding = generateFormFromPrompt("breastfeeding check in");
  breastfeeding.id = "cf-breastfeeding";
  breastfeeding.status = "active";
  breastfeeding.createdOn = addDays(t, -20);
  breastfeeding.updatedOn = addDays(t, -20);
  const feedingSection = breastfeeding.sections.find((s) => s.title === "Feeding");
  const ratingField = feedingSection.fields.find((x) => x.type === "rating");

  const assignments = [
    {
      id: uid(),
      clientId: "c1",
      formId: homeSafety.id,
      sentOn: addDays(t, -13),
      openedOn: addDays(t, -12),
      answers: {
        "sf-support": ["Meals for the first week", "Someone checking in daily"],
        "sf-carseat": "Yes",
      },
      signedOn: null,
      completedOn: addDays(t, -11),
    },
    {
      id: uid(),
      clientId: "c2",
      formId: breastfeeding.id,
      sentOn: addDays(t, -3),
      openedOn: addDays(t, -2),
      answers: ratingField ? { [ratingField.id]: 3 } : {},
      signedOn: null,
      completedOn: null,
    },
  ];

  return { forms: [homeSafety, breastfeeding], assignments };
}
