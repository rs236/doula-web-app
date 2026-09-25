import { useState } from "react";
import { PageHead, Card } from "../../ui.jsx";
import { generateFormFromPrompt } from "../../../lib/aiFormGen.js";

const EXAMPLES = [
  "Create a postpartum home visit assessment form for a 2-week-old baby",
  "Breastfeeding check-in form",
  "New client intake form",
  "Labour preferences check-in before the on-call window",
];

export default function AIFormGenerator({ onGenerated }) {
  const [prompt, setPrompt] = useState("");

  return (
    <>
      <PageHead
        eyebrow="Describe what you need"
        title="Create with AI"
        sub="Type what the form is for. It builds a starting draft from a library of real doula-practice questions — you edit and approve everything before it goes anywhere near a client."
      />
      <Card title="What's this form for?">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Create a postpartum home visit assessment form for a 2-week-old baby"
        />
        <div className="chiprow">
          {EXAMPLES.map((ex) => (
            <button key={ex} className="chip plainchip" onClick={() => setPrompt(ex)}>
              {ex}
            </button>
          ))}
        </div>
        <button
          className="primary"
          disabled={!prompt.trim()}
          onClick={() => onGenerated(generateFormFromPrompt(prompt), prompt)}
        >
          Generate form
        </button>
        <p className="hint">
          This runs entirely in your browser — no client data leaves the app to generate a form. It matches
          your request against common doula-visit question sets, not a live AI model.
        </p>
      </Card>
    </>
  );
}
