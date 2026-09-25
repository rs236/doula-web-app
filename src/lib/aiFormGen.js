/* "Create with AI" — a client-side generator, not a live model call.

   Shipping a real LLM call would mean putting an API key in a browser
   bundle, which this MVP's static-hosting setup (no server) can't do
   safely. Instead this matches keywords in the doula's request against a
   library of real doula-practice field blocks and assembles a form from
   them. It's honest about that in the UI. Swapping in a real model later
   just means replacing generateFormFromPrompt with a fetch to a serverless
   endpoint — the output shape (a form object) stays the same. */

import { makeForm, makeSection, makeField } from "./formEngine.js";

const opt = (type, label, extra = {}) => ({ ...makeField(type), label, ...extra });

const BLOCKS = {
  contact: () =>
    makeSection("Contact", [
      opt("short_text", "Client name"),
      opt("short_text", "Phone number"),
      opt("date", "Date of this visit"),
    ]),
  babyBasics: () =>
    makeSection("About the baby", [
      opt("short_text", "Baby's name"),
      opt("number", "Age in days or weeks"),
      opt("short_text", "Weight at last check"),
    ]),
  feeding: () =>
    makeSection("Feeding", [
      opt("multiple_choice", "Feeding method", { options: ["Breastfeeding", "Formula", "Combination"] }),
      opt("rating", "How is feeding going, 1–5", { max: 5 }),
      opt("long_text", "Feeding concerns"),
      opt("checkboxes", "Signs to watch for", {
        options: ["Poor latch", "Cracked or bleeding nipples", "Baby seems unsatisfied after feeds", "Low wet-diaper count"],
      }),
    ]),
  sleep: () =>
    makeSection("Sleep", [
      opt("rating", "How is baby sleeping, 1–5", { max: 5 }),
      opt("rating", "How is the parent sleeping, 1–5", { max: 5 }),
      opt("long_text", "Sleep concerns"),
    ]),
  mood: () =>
    makeSection("Emotional wellbeing", [
      opt("rating", "Mood this week, 1–5", { max: 5 }),
      opt("yesno", "Do you have someone to hand the baby to when you need a break?"),
      opt("long_text", "Anything on your mind"),
      opt("checkboxes", "Any of these true right now?", {
        options: ["Feeling overwhelmed most days", "Trouble bonding", "Thoughts of harming myself or baby"],
      }),
    ]),
  physical: () =>
    makeSection("Physical recovery", [
      opt("rating", "Pain level, 1–5", { max: 5 }),
      opt("long_text", "Healing — incision, stitches, bleeding"),
      opt("yesno", "Any fever, unusual pain, or heavy bleeding?"),
    ]),
  homeSafety: () =>
    makeSection("Home & safety check", [
      opt("checkboxes", "Household support in place", {
        options: ["Meals arranged", "Help with older children", "Someone checking in daily", "Transport if needed"],
      }),
      opt("long_text", "Anything the household needs"),
    ]),
  labourPrefs: () =>
    makeSection("Labour preferences", [
      opt("multiple_choice", "Pain relief approach", {
        options: ["Unmedicated unless asked", "Open to epidural", "Epidural planned", "Undecided"],
      }),
      opt("checkboxes", "Comfort measures wanted", {
        options: ["Water / shower", "Birth ball", "Counter-pressure", "Movement", "Rebozo"],
      }),
      opt("long_text", "Anything else the care team should know"),
    ]),
  prenatalCheck: () =>
    makeSection("This visit", [
      opt("number", "Weeks pregnant"),
      opt("long_text", "How are you feeling physically"),
      opt("long_text", "Questions for your care provider"),
      opt("rating", "Confidence about the birth, 1–5", { max: 5 }),
    ]),
  consentSign: () =>
    makeSection("Confirmation", [
      opt("consent", "I confirm the information above is accurate"),
      opt("signature", "Signature"),
    ]),
};

const RULES = [
  {
    test: /postpartum|post-?partum|home visit|newborn/i,
    title: "Postpartum Home Visit Assessment",
    description: "A structured check-in covering feeding, sleep, recovery and mood.",
    blocks: ["contact", "babyBasics", "feeding", "sleep", "physical", "mood", "homeSafety", "consentSign"],
    sign: true,
  },
  {
    test: /breastfeed|lactat|feeding/i,
    title: "Breastfeeding Check-In",
    description: "A focused feeding assessment for a follow-up visit.",
    blocks: ["contact", "babyBasics", "feeding", "consentSign"],
    sign: false,
  },
  {
    test: /mental health|mood|wellness|wellbeing|depress|anxiet/i,
    title: "Postpartum Mood & Wellness Screening",
    description: "A gentle check on how the parent is doing emotionally.",
    blocks: ["contact", "mood", "consentSign"],
    sign: false,
  },
  {
    test: /labour|labor|birth pref/i,
    title: "Labour Preferences Check-In",
    description: "A quick capture of birth preferences ahead of labour.",
    blocks: ["contact", "labourPrefs", "consentSign"],
    sign: false,
  },
  {
    test: /prenatal|antenatal|pregnan/i,
    title: "Prenatal Visit Notes",
    description: "Notes template for a routine prenatal visit.",
    blocks: ["contact", "prenatalCheck", "consentSign"],
    sign: false,
  },
  {
    test: /intake|onboard|new client/i,
    title: "New Client Intake",
    description: "First-contact intake for a prospective client.",
    blocks: ["contact", "prenatalCheck", "consentSign"],
    sign: true,
  },
];

const FALLBACK = {
  title: "Client Check-In",
  description: "A general-purpose check-in form — edit freely before sending.",
  blocks: ["contact", "mood", "consentSign"],
  sign: false,
};

/**
 * Turn a plain-language request into an editable form object.
 * Deterministic and offline — see the file header for why.
 */
export function generateFormFromPrompt(prompt) {
  const text = (prompt || "").trim();
  const rule = RULES.find((r) => r.test.test(text)) || null;
  const chosen = rule || FALLBACK;

  const form = makeForm({
    title: rule ? rule.title : text ? titleCase(text).slice(0, 60) : FALLBACK.title,
    description: chosen.description,
    sign: chosen.sign,
  });
  form.source = "ai";
  form.sections = chosen.blocks.map((key) => BLOCKS[key]());
  return form;
}

function titleCase(s) {
  const cleaned = s.replace(/^create( a| an)?\s*/i, "").replace(/\s+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
