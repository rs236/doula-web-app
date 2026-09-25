# MaternalSupportCo — Doula practice workspace

A React + Vite web app. Two views in one build: the doula's workspace and the client's portal,
switched from the header.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm test         # 69-check smoke test that drives the real UI, incl. Form Studio end to end
```

## Where the data lives

Everything is saved in the browser's `localStorage` under the key `msc-doula-mvp-v1`.

That means:

- no account and no login
- no server and no database
- records do not travel between devices or browsers
- the client portal's "viewing as" client is a demo switcher, not real per-person auth — a
  reload falls back to the first client, same as everything else in the practice
- clearing site data, or using private browsing, wipes the practice
- anyone with access to that browser profile can read it

Settings → Your data has a JSON backup download and a reset. When a browser blocks storage entirely,
the app says so in a banner instead of silently losing work.

First load seeds a demo practice — three clients at different stages, open slots, a payment
schedule, two Form Studio forms already in use, and one flagged postpartum check-in — so the
on-call board and Form Studio are populated from the start. Dates are relative to first load,
so the demo is never stale.

## Form Studio

A schema-driven form engine sits under both the original seven packet documents and anything a
doula builds herself: **Form → Sections → Fields → Response**. The same engine, renderer, send
mechanism, status tracking, and signature flow serve both.

**"Create with AI"** is a client-side generator, not a live model call — this static build has no
server to hold an API key. It matches the doula's request against a library of real doula-visit
question blocks (postpartum, feeding, mood, labour preferences, intake) and assembles an editable
draft from them. The UI says so plainly. Swapping in a real LLM later means replacing
`src/lib/aiFormGen.js` with a call to a serverless endpoint — the output shape (a form object)
stays the same, so nothing downstream needs to change.

**Manual builder** starts from a blank form and uses the identical section/field editor.

Both paths land in the same editor before saving: add/edit/delete/reorder/duplicate fields, add
sections, mark fields required, preview as the client will see it, then save as a draft or
publish to My Forms.

Field types: short text, long text, yes/no, multiple choice, checkboxes, dropdown, date, time,
number, rating, signature, initials, consent checkbox — each with its own required toggle.

Sending, filling, autosave, required-field validation, and the signature audit trail all reuse
the exact mechanism the original packet documents already used — there's one form-sending system
in the app, not two. Status moves through Sent → Opened → In progress → Completed → (Signed),
visible from Form Studio, Documents, and the client's own profile.

## Structure

```
src/
  main.jsx               mount
  App.jsx                shell, nav, role switch, persistence, hash routing
  data/forms.js          the built-in client packet schema + postpartum questions
  data/customForms.js    Form Studio demo seed (built with matching assignments)
  data/seed.js           demo practice
  lib/date.js            dates and gestational age
  lib/storage.js         localStorage read/write + backward-compatible hydration
  lib/derive.js          alerts engine and derived summaries
  lib/formEngine.js      the generic Form/Section/Field/Response schema, shared by every form
  lib/aiFormGen.js       the "Create with AI" template generator
  components/ui.jsx      shared primitives
  components/doula/      Today, OnCall, Clients, Schedule, Docs, FormStudio, BirthLog,
                         Postpartum, Money, Backup, Mileage, Settings
  components/doula/forms/  MyForms, AIFormGenerator, FormEditor, FieldRow, FormPreview
  components/portal/     PortalHome, PortalForms, FormFill, PortalBook, CareCard
  styles/app.css         the whole visual system
```

Navigation is hash-based (`#/clients`, `#/p-forms`), so refresh and browser back both work, and
`vercel.json` rewrites everything to `/` so no URL can 404.

## Deploy to Vercel

The project is already configured — `vercel.json` sets the framework, build command and output
directory. Two ways to ship it:

**Through GitHub (recommended)**

1. `git init && git add . && git commit -m "Doula practice MVP"`
2. Create an empty repo on GitHub, then
   `git remote add origin <your-repo-url> && git push -u origin main`
3. On vercel.com → Add New → Project → import that repo.
4. Vercel detects Vite. Leave the defaults (build `npm run build`, output `dist`). Deploy.

**From this machine**

```bash
npm i -g vercel
vercel login
vercel --prod
```

No environment variables are needed. Nothing else to configure.

## Not in this build, on purpose

No authentication, no backend, no payment processing, no notifications, no multi-device sync.
The moment two people need the same data, this needs a real database — that's the next decision,
not something to fake now.
