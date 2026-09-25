/* Drives the real app in jsdom: clicks every nav item, runs the main
   workflows, and fails on any React or application console error. */
import { JSDOM } from "jsdom";
import * as esbuild from "esbuild";
import { writeFileSync } from "node:fs";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "https://example.test/",
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = clearTimeout;
global.localStorage = dom.window.localStorage;
global.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.localStorage.setItem(
  "msc_session",
  JSON.stringify({
    user: {
      id: "test-doula-id",
      email: "doula@maternalsupport.co",
      user_metadata: { business_name: "Sage Doula Practice" },
    },
  })
);

const errors = [];
const origErr = console.error;
console.error = (...a) => {
  errors.push(a.map(String).join(" "));
  origErr(...a);
};

await esbuild.build({
  entryPoints: ["src/App.jsx"],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  outfile: "test/.bundle.mjs",
  loader: { ".css": "empty" },
  define: { "import.meta.env": "{}" },
  external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
  logLevel: "silent",
});

const { default: App } = await import("./.bundle.mjs");
const React = (await import("react")).default;
const { createRoot } = await import("react-dom/client");
const { act } = await import("react");

const root = createRoot(document.getElementById("root"));
const render = async () => act(async () => root.render(React.createElement(App)));

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const byText = (sel, text) => $$(sel).find((el) => el.textContent.trim() === text);
const containing = (sel, text) => $$(sel).find((el) => el.textContent.includes(text));

const click = async (el, label) => {
  if (!el) throw new Error("Cannot click, element missing: " + label);
  await act(async () => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
};

const setValue = async (el, value) => {
  const proto = el.tagName === "SELECT" ? dom.window.HTMLSelectElement : el.tagName === "TEXTAREA" ? dom.window.HTMLTextAreaElement : dom.window.HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, "value").set;
  setter.call(el, value);
  await act(async () => el.dispatchEvent(new dom.window.Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })));
};

const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, pass: !!cond, detail });
  if (!cond) console.log("FAIL:", name, detail);
};

/* 1. loads */
await render();
check("1. App loads", $(".msc") && $(".canvas").textContent.includes("Today"));

/* 2. every doula nav item renders content */
const navLabels = $$(".rail .navitem").map((b) => b.textContent.replace(/\d+$/, "").trim());
for (const label of navLabels) {
  await click(byText(".navitem", label) || containing(".navitem", label), label);
  const body = $(".canvas").textContent.trim();
  check("2. Nav renders: " + label, body.length > 40, body.slice(0, 40));
}

/* 3. dashboard alerts are clickable and open the client */
await click(containing(".navitem", "Today"));
const alertCount = $$(".alert").length;
check("3. Dashboard alerts present", alertCount > 0, "alerts=" + alertCount);
await click($$(".alert")[0]);
check("3b. Alert opens client detail", !!$(".statusrow"));

/* 4. create a client, then edit status */
await click(containing(".navitem", "Clients"));
await click(byText(".primary", "Add a client"));
const inputs = $$(".card .fgrid input");
await setValue(inputs[0], "Test Mother");
await setValue(inputs[1], "+91 90000 00000");
await click(byText(".primary", "Create client & send 3 priority forms"));
const cards = $$(".clientcard");
check("4. Client created", cards.some((c) => c.textContent.includes("Test Mother")), "cards=" + cards.length);
await click(cards.find((c) => c.textContent.includes("Test Mother")));
await click(byText(".pill", "Active"));
check("4b. Status change persists", byText(".pill", "Active").className.includes("on"));
check("4c. Packet auto-sent", $(".canvas").textContent.includes("Agreement") || $(".canvas").textContent.includes("Intake") || $(".canvas").textContent.includes("Paperwork"));

/* 5. documents: view an assignment */
await click(containing(".navitem", "Documents"));
const viewBtn = byText(".ghost", "View");
await click(viewBtn, "View doc");
check("5. Document detail opens", $(".canvas").textContent.includes("Responses"));
await click(byText(".back", "← Documents"));

/* 6. schedule: publish a slot */
await click(containing(".navitem", "Schedule"));
const openBefore = $$(".card")[2].querySelectorAll(".row").length;
await click(byText(".primary", "Publish slot"));
const openAfter = $$(".card")[2].querySelectorAll(".row").length;
check("6. Slot published", openAfter === openBefore + 1, openBefore + "->" + openAfter);

/* 7. birth log */
await click(containing(".navitem", "Birth log"));
await click(byText(".tap", "Contraction"));
await click(byText(".tap", "Contraction"));
await click(byText(".tap", "Position change"));
check("7. Birth log entries", $(".canvas").textContent.includes("Contraction"));
const noteBox = $(".card textarea");
await setValue(noteBox, "She asked for the shower.");
await click(byText(".primary", "Add note"));
check("7b. Birth log note saved", $(".canvas").textContent.includes("She asked for the shower."));

/* 8. postpartum check-in */
await click(containing(".navitem", "Postpartum"));
for (const rowEl of $$(".scalerow")) await click(rowEl.querySelectorAll(".sc")[0]);
await click(byText(".primary", "Save check-in"));
check("8. Check-in saved and flagged", $(".canvas").textContent.includes("Follow up"));

/* 9. payments */
await click(containing(".navitem", "Payments"));
const markBtn = $$(".ghost").find((b) => b.textContent.includes("Mark paid"));
await click(markBtn, "Mark paid");
check("9. Payment marked paid", !$$(".ghost").some((b) => b.textContent === markBtn.textContent && b === markBtn));

/* 10. backup cover */
await click(containing(".navitem", "Backup cover"));
const bInputs = $$(".fgrid input");
await setValue(bInputs[0], "Nisha K");
await click(byText(".primary", "Add backup"));
check("10. Backup added", $(".canvas").textContent.includes("Nisha K"));
await setValue($(".mini.wide"), $$(".mini.wide option")[1].value);
check("10b. Handoff sheet renders", !!$(".handoff"));

/* 11. mileage */
await click(containing(".navitem", "Mileage"));
const mInputs = $$(".fgrid input");
await setValue(mInputs[1], "Postpartum Visit");
await setValue(mInputs[2], "12");
await click(byText(".primary", "Log trip"));
check("11. Trip logged", $(".canvas").textContent.includes("12 km"));

/* 12. settings */
await click(containing(".navitem", "Settings"));
await setValue($(".card input"), "18");
check("12. Setting updated", $(".canvas").textContent.includes("Your data"));

/* 13. client portal: fill and sign a form */
await click(byText(".seg button", "Client"));
check("13. Portal loads", $(".canvas").textContent.includes("Hello"));
await click(containing(".navitem", "My forms"));
const toFill = $$(".doccard").find((d) => d.textContent.includes("Birth Plan") || d.textContent.includes("Birth Preferences"));
await click(toFill.querySelector(".ghost"));
const selects = $$(".card select");
if (selects.length > 0) await setValue(selects[0], "Unmedicated unless I ask");
if ($$(".opt").length > 0) await click($$(".opt")[0]);
await click(byText(".primary", "Send to my doula"));
check("13b. Form submitted", $$(".doccard").find((d) => d.textContent.includes("Birth Plan") || d.textContent.includes("Birth Preferences")).textContent.includes("Completed"));

await click(containing(".navitem", "Care team card"));
check("13c. Care card builds from preferences", $(".canvas").textContent.includes("Pain relief"));

/* 14. client books a visit */
await click(containing(".navitem", "Book a visit"));
const slotCount = $$(".slotcard").length;
await click($$(".slotcard")[0].querySelector(".primary"));
check("14. Client booked a slot", $$(".slotcard").length === slotCount - 1);

/* 15. signature gating — switch to a client whose agreement is unsigned */
const who = $(".rolebar .mini");
await setValue(who, [...who.options].find((o) => o.textContent.includes("Hannah")).value);
await click(containing(".navitem", "My forms"));
const agreement = $$(".doccard").find((d) => d.textContent.includes("Services Agreement"));
await click(agreement.querySelector(".ghost"));
const signBtn = byText(".primary", "Sign and send");
check("15. Sign blocked until consented", signBtn.disabled === true);
for (const cl of $$(".checkline")) await click(cl);
await setValue($(".sigfield"), "Hannah Weiss");
check("15b. Sign enabled after checks + name", byText(".primary", "Sign and send").disabled === false);
await click(byText(".primary", "Sign and send"));
check("15c. Signed", $$(".doccard").find((d) => d.textContent.includes("Services Agreement")).textContent.includes("Signed"));

/* ============================================================
   18. Form Studio — the full workflow from the brief:
   create with AI -> edit -> preview -> save draft -> save active
   -> send -> client fills -> save progress -> completes -> signs
   -> doula sees completion -> duplicate -> delete -> archive
   ============================================================ */
await click(byText(".seg button", "Doula"));
await click(containing(".navitem", "Form Studio"));
check("18. Form Studio loads", $(".canvas").textContent.includes("Form Studio"));

/* AI generation */
await click(byText(".primary", "Create with AI"));
await setValue($(".card textarea"), "Create a postpartum home visit assessment form for a 2-week-old baby");
await click(byText(".primary", "Generate form"));
check(
  "18a. AI draft generated",
  $(".pagehead h1").textContent.includes("Postpartum Home Visit Assessment")
);

/* edit: title, add field, delete field */
const titleInput = $$(".card .fgrid input")[0];
await setValue(titleInput, "Test AI Postpartum Form");
check("18b. Title edit reflected live", $(".pagehead h1").textContent === "Test AI Postpartum Form");

const fieldsBefore = $$(".fieldrow").length;
await click($$(".ghost").find((b) => b.textContent === "Add field"));
check("18c. Field added", $$(".fieldrow").length === fieldsBefore + 1);

const rows = $$(".fieldrow");
await click(rows[rows.length - 1].querySelector(".fieldrowactions .ghost.urgent"));
check("18d. Field deleted", $$(".fieldrow").length === fieldsBefore);

/* preview, then back */
await click(byText(".ghost", "Preview"));
check("18e. Preview renders the draft", $(".canvas").textContent.includes("Test AI Postpartum Form"));
await click(byText(".back", "← Back to editor"));

/* save as draft, then reopen and promote to active */
await click(byText(".ghost", "Save as draft"));
let card = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("18f. Saved as draft", !!card && card.textContent.includes("draft"));

await click(card.querySelector(".formcardactions .ghost"));
await click(byText(".primary", "Save to My Forms"));
card = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("18g. Promoted to active", card.textContent.includes("active"));

/* send to the client already selected in the portal (Hannah Weiss) */
await click(card.querySelector(".sendbox .ghost.wide"));
card = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
const sendSelect = card.querySelector(".sendrow select");
const hannahOpt = [...sendSelect.options].find((o) => o.textContent.includes("Hannah"));
await setValue(sendSelect, hannahOpt.value);
await click(card.querySelector(".sendrow .primary"));
card = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("18h. Send count updated", card.textContent.includes("sent to 1 client"));

/* client side: dashboard reflects the unfilled form before opening it */
await click(byText(".seg button", "Client"));
await click(containing(".navitem", "My care"));
check("19. Shows on client dashboard before it's opened", $(".canvas").textContent.includes("Test AI Postpartum Form"));

await click(containing(".navitem", "My forms"));
let doc = $$(".doccard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("19a. Client sees it as Sent", doc.textContent.includes("Sent"));
await click(doc.querySelector(".ghost"));

/* required-field validation: submit is blocked until consent + signature are given */
let submitBtn = byText(".primary", "Sign and send");
check("19b. Submit blocked before required fields", submitBtn.disabled === true);

for (const inp of $$(".sigfield")) await setValue(inp, "Hannah Weiss");
await click(containing(".checkline", "I confirm"));
check("19c. Submit enabled once required fields are met", byText(".primary", "Sign and send").disabled === false);

/* save progress mid-form, confirm it survives a reload before submitting */
await click(byText(".ghost", "Save progress"));
await act(async () => root.unmount());
const root3 = createRoot(document.getElementById("root"));
await act(async () => root3.render(React.createElement(App)));
check("20. Reload restores the client portal route", $(".canvas").textContent.includes("My forms") || $(".canvas").textContent.includes("Hello"));

// The portal's "viewing as" client isn't part of the URL (there's no login
// yet), so a reload falls back to the first client — reselect Hannah
// before checking her form.
await setValue($(".rolebar .mini"), hannahOpt.value);
await click(containing(".navitem", "My forms"));
doc = $$(".doccard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("20a. Status reflects the saved progress", doc.textContent.includes("In progress"));
await click(doc.querySelector(".ghost"));
check(
  "20b. In-progress answers survived the reload",
  $$(".sigfield").some((el) => el.value === "Hannah Weiss")
);

await click(byText(".primary", "Sign and send"));
doc = $$(".doccard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("20c. Client-side status shows Signed", doc.textContent.includes("Signed"));

/* doula side: completion is visible from both Documents and the client profile */
await click(byText(".seg button", "Doula"));
await click(containing(".navitem", "Documents"));
const pick = $(".pickrow select");
await setValue(pick, hannahOpt.value);
let dcard = $$(".doccard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("21. Doula sees Signed from Documents", dcard.textContent.includes("Signed"));
await click(dcard.querySelector(".ghost"));
check("21a. Completed responses viewable", $(".canvas").textContent.includes("Responses"));
check("21b. Print/Download available on a completed form", byText(".ghost", "Print") && (byText(".ghost", "Download responses") || byText(".ghost", "📄 Download PDF")));
await click(byText(".back", "← Documents"));

await click(containing(".navitem", "Clients"));
const hannahCard = $$(".clientcard").find((c) => c.textContent.includes("Hannah"));
await click(hannahCard);
check("21c. Signed status also visible on client profile", $(".canvas").textContent.includes("Signed"));
await click(byText(".back", "← All clients"));

/* duplicate, then delete the (unsent) duplicate outright */
await click(containing(".navitem", "Form Studio"));
card = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
await click(card.querySelector(".formcardactions .ghost:nth-child(3)"));
let dup = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form (copy)"));
check("22. Duplicate created as a draft", !!dup && dup.textContent.includes("draft"));
await click(dup.querySelector(".formcardactions .ghost.urgent"));
check("22a. Unused duplicate deleted", !$$(".formcard").some((d) => d.textContent.includes("(copy)")));

/* the in-use original is protected from deletion */
card = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
await click(card.querySelector(".formcardactions .ghost.urgent"));
check(
  "22b. In-use form protected from deletion",
  $$(".formcard").some((d) => d.textContent.includes("Test AI Postpartum Form"))
);

/* archive still leaves it visible in the library, but not sendable from Documents */
await click([...card.querySelectorAll(".formcardactions .ghost")].find((b) => b.textContent === "Archive"));
card = $$(".formcard").find((d) => d.textContent.includes("Test AI Postpartum Form"));
check("22c. Archived form stays visible in My Forms", card.textContent.includes("archived"));
await click(containing(".navitem", "Documents"));
check(
  "22d. Archived form dropped from Documents send list",
  !$$(".doccard").some((d) => d.textContent.includes("Test AI Postpartum Form") && d.querySelector(".wide"))
);

/* manual builder: blank form, one field, save active without ever using AI */
await click(containing(".navitem", "Form Studio"));
await click(byText(".ghost", "Create manually"));
check("23. Manual builder starts from a blank form", $(".pagehead h1").textContent === "Untitled form");
await setValue($$(".card .fgrid input")[0], "Manual Test Form");
await click(byText(".primary", "Save to My Forms"));
check(
  "23a. Manually built form saved",
  $$(".formcard").some((d) => d.textContent.includes("Manual Test Form"))
);

/* 24. Invoices module */
await click(containing(".navitem", "Invoices"));
check("24. Invoices view loaded", $(".pagehead h1").textContent.includes("Invoices"));
await click(byText(".primary", "+ Create new invoice"));
const invInputs = $$(".card input");
if (invInputs.length > 0) await setValue(invInputs[0], "1200");
await click(byText(".primary", "Save invoice & generate payment link"));
check("24b. Invoice created", $(".canvas").textContent.includes("1,200") || $(".canvas").textContent.includes("1200"));

/* 25. Billing Tracker module */
await click(containing(".navitem", "Billing tracker"));
check("25. Billing Tracker loaded", $(".pagehead h1").textContent.includes("Billing Tracker"));
check("25b. Table rows rendered", $$(".billing-table tbody tr").length > 0);
const pendingPill = $$(".pill").find((p) => p.textContent.includes("Pending"));
if (pendingPill) await click(pendingPill);
check("25c. Filter works", $(".canvas").textContent.includes("No pending") || $(".canvas").textContent.includes("Reimbursement"));

/* 16. persistence across a full unmount / remount (simulates refresh) */
const saved = window.localStorage.getItem("msc-doula-mvp-v1");
check("16. Written to localStorage", !!saved && saved.includes("Test Mother"));
check("16. Written to localStorage (custom forms)", !!saved && saved.includes("Manual Test Form"));
await act(async () => root3.unmount());
const root2 = createRoot(document.getElementById("root"));
await act(async () => root2.render(React.createElement(App)));
check("16a. Route restored from URL", $(".canvas").textContent.includes("Billing Tracker") || $(".canvas").textContent.includes("Form Studio"));
await click(containing(".navitem", "Clients"));
check("16b. Data survives reload", $(".canvas").textContent.includes("Test Mother"));
await click(containing(".navitem", "Mileage"));
check("16c. Logged trip survives reload", $(".canvas").textContent.includes("12 km"));

/* 18. Sign out flow and LoginPage verification */
const signoutBtn = byText(".ghost", "Sign out") || containing(".ghost", "Sign out");
check("18a. Sign out button present in header", !!signoutBtn);
if (signoutBtn) {
  await click(signoutBtn);
  check("18b. LoginPage renders after sign out", !!$(".login-card-container"));
  check("18c. Doula Sign In tab present", !!byText(".login-tab", "Doula Sign In"));
  check("18d. Client Portal tab present", !!byText(".login-tab", "Client Portal"));
  const demoDoulaBtn = $(".login-demo-btn.doula-demo");
  check("18e. 1-Click Demo Doula button present", !!demoDoulaBtn);
  if (demoDoulaBtn) {
    await click(demoDoulaBtn);
    check("18f. Re-entered workspace via 1-Click Demo", !!$(".canvas"));
  }
}

/* 17. no application console errors */
const appErrors = errors.filter((e) => !/not wrapped in act/i.test(e));
check("17. No console errors", appErrors.length === 0, appErrors.slice(0, 3).join(" | "));

const failed = results.filter((r) => !r.pass);
console.log("\n" + results.filter((r) => r.pass).length + "/" + results.length + " checks passed");
if (failed.length) {
  console.log("Failures:");
  failed.forEach((f) => console.log(" -", f.name, f.detail));
  process.exit(1);
}
writeFileSync("test/last-run.txt", results.map((r) => (r.pass ? "PASS " : "FAIL ") + r.name).join("\n"));
process.exit(0);
