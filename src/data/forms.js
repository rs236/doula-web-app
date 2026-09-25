/* The client packet. Each form renders from this schema. */

export const FORMS = [
  {
    id: "intake",
    title: "Client Intake",
    category: "Onboarding",
    sign: false,
    blurb: "Contact details, pregnancy history, care team.",
    sections: [
      {
        title: "About you",
        fields: [
          { id: "name", label: "Full name", type: "text" },
          { id: "phone", label: "Best phone number", type: "tel" },
          { id: "partner", label: "Partner or primary support person", type: "text" },
          { id: "address", label: "Home address", type: "textarea" },
          { id: "emerg", label: "Emergency contact (name + phone)", type: "text" },
        ],
      },
      {
        title: "This pregnancy",
        fields: [
          { id: "edd", label: "Estimated due date", type: "date" },
          { id: "parity", label: "Is this your first baby?", type: "radio", options: ["Yes", "No"] },
          { id: "provider", label: "Care provider (OB, midwife, practice)", type: "text" },
          { id: "birthplace", label: "Planned place of birth", type: "text" },
          {
            id: "prevbirth",
            label: "Anything from a previous birth you want me to know?",
            type: "textarea",
          },
        ],
      },
      {
        title: "Support",
        fields: [
          {
            id: "hopes",
            label: "What are you hoping doula support looks like for you?",
            type: "textarea",
          },
          { id: "worries", label: "What are you most worried about?", type: "textarea" },
          {
            id: "contact",
            label: "How should I reach you when labour starts?",
            type: "select",
            options: ["Call me", "Call my partner", "Text first, then call", "Either of us"],
          },
        ],
      },
    ],
  },
  {
    id: "agreement",
    title: "Services Agreement",
    category: "Legal",
    sign: true,
    blurb: "Package, fees, on-call period, cancellation terms.",
    sections: [
      {
        title: "Terms",
        fields: [
          {
            id: "read",
            label: "I have read the full services agreement and fee schedule.",
            type: "check",
          },
          {
            id: "oncall",
            label:
              "I understand the on-call period runs from 38w0d until my baby is born, and that a backup doula covers any gap.",
            type: "check",
          },
          { id: "questions", label: "Questions before signing", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "scope",
    title: "Scope of Practice & Informed Consent",
    category: "Legal",
    sign: true,
    blurb: "What a doula does and does not do. Protects both of you.",
    sections: [
      {
        title: "Acknowledgement",
        fields: [
          {
            id: "nonclinical",
            label:
              "I understand my doula provides physical, emotional and informational support, and does not perform clinical tasks or give medical advice.",
            type: "check",
          },
          {
            id: "nodecisions",
            label:
              "I understand my doula does not make decisions for me or speak to my care team on my behalf.",
            type: "check",
          },
          {
            id: "nodiagnosis",
            label: "I understand my doula does not diagnose conditions or interpret test results.",
            type: "check",
          },
        ],
      },
    ],
  },
  {
    id: "backup",
    title: "Backup Doula Agreement",
    category: "Legal",
    sign: true,
    blurb: "Who attends if your doula cannot, and how the handoff works.",
    sections: [
      {
        title: "Coverage",
        fields: [
          {
            id: "ack",
            label:
              "I understand a named backup doula may attend my birth if my primary doula is unavailable, and that she will receive my birth preferences and care team details.",
            type: "check",
          },
          {
            id: "meet",
            label: "I would like to meet my backup doula",
            type: "radio",
            options: ["Yes", "No"],
          },
        ],
      },
    ],
  },
  {
    id: "confid",
    title: "Confidentiality & Media Release",
    category: "Legal",
    sign: true,
    blurb: "Photo, video and story permissions — opt-in, never assumed.",
    sections: [
      {
        title: "Permissions",
        fields: [
          {
            id: "photos",
            label: "My doula may take photos during labour and birth for my own use",
            type: "radio",
            options: ["Yes", "No"],
          },
          {
            id: "share",
            label: "My doula may share photos publicly (faces hidden)",
            type: "radio",
            options: ["Yes", "No", "Ask me each time"],
          },
          {
            id: "story",
            label: "My doula may share my birth story anonymously",
            type: "radio",
            options: ["Yes", "No"],
          },
        ],
      },
    ],
  },
  {
    id: "birthprefs",
    title: "Birth Plan",
    category: "Planning",
    sign: false,
    blurb: "Labor environment, comfort measures, medical preferences, and postpartum wishes.",
    sections: [
      {
        title: "Atmosphere",
        fields: [
          {
            id: "vibe",
            label: "Environment",
            type: "multi",
            options: [
              "Dim lighting",
              "My own playlist",
              "Quiet voices",
              "Minimal people",
              "Aromatherapy",
            ],
          },
          { id: "support", label: "Who will be in the room", type: "text" },
        ],
      },
      {
        title: "Labour",
        fields: [
          {
            id: "comfort",
            label: "Comfort measures I want available",
            type: "multi",
            options: [
              "Water / shower",
              "Birth ball",
              "Counter-pressure",
              "Movement & position changes",
              "TENS",
              "Rebozo",
            ],
          },
          {
            id: "pain",
            label: "Pain relief approach",
            type: "select",
            options: [
              "Unmedicated unless I ask",
              "Open to epidural, offer it",
              "Epidural planned",
              "Undecided — talk me through it",
            ],
          },
          {
            id: "monitor",
            label: "Monitoring preference",
            type: "select",
            options: ["Intermittent if possible", "Continuous is fine", "Follow provider guidance"],
          },
          { id: "avoid", label: "Please don't offer me", type: "textarea" },
        ],
      },
      {
        title: "Birth & immediately after",
        fields: [
          {
            id: "pushing",
            label: "Pushing preference",
            type: "select",
            options: ["Follow my body", "Coached is fine", "Whatever is safest"],
          },
          {
            id: "after",
            label: "After baby arrives",
            type: "multi",
            options: [
              "Immediate skin-to-skin",
              "Delayed cord clamping",
              "Partner cuts cord",
              "Delay weighing",
              "Keep placenta",
            ],
          },
          {
            id: "feeding",
            label: "Feeding plan",
            type: "select",
            options: ["Breastfeeding", "Formula", "Combination", "Deciding"],
          },
        ],
      },
      {
        title: "If plans change",
        fields: [
          {
            id: "cesarean",
            label: "If a caesarean becomes necessary, what matters most to me",
            type: "textarea",
          },
          { id: "notes", label: "Anything else my care team should know", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "ppplan",
    title: "Postpartum Plan",
    category: "Planning",
    sign: false,
    blurb: "Meals, help, recovery, visitor rules.",
    sections: [
      {
        title: "The first two weeks",
        fields: [
          { id: "help", label: "Who is helping, and on which days", type: "textarea" },
          { id: "meals", label: "Meal plan", type: "textarea" },
          { id: "visitors", label: "Visitor rules", type: "textarea" },
          { id: "siblings", label: "Older children / pets", type: "textarea" },
          { id: "warning", label: "Signs we'd call the provider about", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "eval",
    title: "Client Evaluation",
    category: "Closure",
    sign: false,
    blurb: "Feedback plus a testimonial request.",
    sections: [
      {
        title: "Your experience",
        fields: [
          { id: "rating", label: "How supported did you feel, 1–10", type: "scale" },
          { id: "best", label: "What helped most", type: "textarea" },
          { id: "improve", label: "What could I have done better", type: "textarea" },
          {
            id: "testimonial",
            label: "May I share your words publicly?",
            type: "radio",
            options: ["Yes, with my first name", "Yes, anonymously", "No"],
          },
        ],
      },
    ],
  },
];

export const formById = (id) => FORMS.find((f) => f.id === id);

/** The 3 priority V1 templates sent when a client is onboarded. */
export const PACKET = ["intake", "agreement", "birthprefs"];

/** Weekly postpartum pulse. Conversation prompts, not a screening instrument. */
export const CHECK_Qs = [
  { id: "mood", label: "Most days this week I've felt like myself" },
  { id: "sleep", label: "I'm resting when the baby rests" },
  { id: "support", label: "I have someone to hand the baby to" },
  { id: "feeding", label: "Feeding is going the way I hoped" },
  { id: "anxiety", label: "I can settle when the baby is settled" },
];
