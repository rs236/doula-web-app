/**
 * Comprehensive Legal & Regulatory Policies for MaternalSupportCo Hub
 * Consolidated 5-Hub Architecture with 100% regulatory coverage:
 * 1. Privacy Policy (GDPR, India DPDPA, US CCPA/CPRA, WA MHMDA, ROPA, Subprocessors, Retention, Children)
 * 2. Terms of Service & Acceptable Use (SaaS Terms, Doula Scope, DPA Terms, Billing)
 * 3. Health Data, HIPAA & BAA Guide (Non-Clinical Doula Scope vs HIPAA Covered Entity, BAA Workflow, FTC HBNR)
 * 4. Security, AI Transparency & Vulnerability Disclosure (Safeguards, AI Heuristic Notice, Vulnerability Disclosure, Breach Response)
 * 5. Medical & Doula Services Disclaimer (Non-Clinical Scope, Postpartum Disclaimers, Emergency Crisis Lines)
 */

export const LEGAL_POLICIES = {
  privacy: {
    id: "privacy",
    title: "Comprehensive Privacy Policy",
    subtitle: "Global Privacy Disclosures under GDPR, India DPDPA 2023, US CCPA/CPRA, and State Health Data Laws",
    lastUpdated: "2026-09-25",
    sections: [
      {
        id: "overview",
        title: "1. Scope & Legal Framework",
        content: `MaternalSupportCo Hub ("we", "us", "our", or the "Platform") provides a practice management workspace designed specifically for doulas, midwives, and birth workers ("Practitioners" or "Doulas") and their clients ("Clients" or "Birthing Parents").

This Privacy Policy sets forth our mandatory privacy disclosures and governs the collection, processing, storage, disclosure, and erasure of personal data under applicable data protection laws, including:
• The European Union and United Kingdom General Data Protection Regulation (Regulation (EU) 2016/679, "GDPR") and the ePrivacy Directive (2002/58/EC);
• The India Digital Personal Data Protection Act, 2023 ("DPDPA") and Draft DPDP Rules, 2025;
• The California Consumer Privacy Act of 2018, as amended by the California Privacy Rights Act ("CCPA/CPRA"), and equivalent comprehensive state privacy statutes in Colorado (CPA), Connecticut (CTDPA), Virginia (VCDPA), and Texas (TDPSA);
• Consumer Health Data statutes, including the Washington My Health My Data Act ("MHMDA", RCW 19.373) and Nevada SB 370;
• The United States Federal Trade Commission (FTC) Health Breach Notification Rule (16 C.F.R. Part 318) and Section 5 of the FTC Act.

[REQUIRES HUMAN REVIEW: Insert registered legal corporate entity name, registered office address, company registration number, and primary supervisory authority].`,
      },
      {
        id: "roles",
        title: "2. Controller vs. Processor (Data Fiduciary vs. Data Processor)",
        content: `Under data protection frameworks, roles are clearly demarcated:
• Independent Doulas / Practitioners act as the **Data Controller** (under GDPR Art 4(7)) and **Data Fiduciary** (under India DPDPA Sec 2(i)) regarding the personal, reproductive, and health data collected directly from their Clients.
• MaternalSupportCo Hub operates as the **Data Processor** (under GDPR Art 4(8)) and **Data Processor** (under DPDPA Sec 2(k)), processing Client records solely on behalf of, and under documented instructions from, the respective Practitioner.
• Regarding Practitioner account registration, billing data, and direct platform telemetry, MaternalSupportCo Hub acts as an independent Data Controller.`,
      },
      {
        id: "ropa",
        title: "3. Complete Record of Processing Activities (ROPA) & Data Categories",
        content: `In accordance with GDPR Article 30 and DPDPA Section 6, we maintain a complete, truthful inventory of all categories of personal data processed by the Platform:

A. Personal Identifiers:
• Fields: Full legal name, preferred name, email address, mobile phone number, home residence address, primary partner/support person name, and emergency contact details.
• Purpose: Account setup, appointment scheduling, client communication, home visit navigation.
• Lawful Basis: Performance of a contract (GDPR Art 6(1)(b)) / Express consent (DPDPA Sec 6).

B. Special Category: Reproductive & Perinatal Health Data (GDPR Art 9 / Sensitive Personal Info):
• Fields: Estimated due date (EDD), gestational age, pregnancy history, parity, prior birth trauma or complications, primary healthcare provider (OB/GYN, midwife), planned place of birth (hospital, birth center, home birth), labor atmosphere preferences, comfort measure requests (TENS, hydrotherapy, rebozo), pain relief intentions (epidural, unmedicated), fetal monitoring preferences, pushing position preferences, placenta retention wishes, infant feeding plan (breastfeeding, formula, combination), and contingency caesarean preferences.
• Purpose: Delivery of personalized doula support, birth plan preparation, and labor continuity.
• Lawful Basis: Explicit consent (GDPR Art 9(2)(a)) / Specific consent for health data (DPDPA Sec 6) / Washington MHMDA valid consumer authorization.

C. Special Category: Clinical & Physiological Labor Events:
• Fields: Contraction frequency timestamps, care provider arrivals, membrane rupture notes, epidural placement records, pushing phase progression, newborn birth timestamp, and observational labor notes.
• Purpose: Real-time labor event tracking and birth story draft documentation.
• Lawful Basis: Explicit consent (GDPR Art 9(2)(a)) / Vital interests during labor emergencies (GDPR Art 9(2)(c)).

D. Special Category: Postpartum Wellbeing & Mental Health Pulse:
• Fields: Weekly postpartum recovery scores (mood stability, sleep restfulness, emotional support, feeding satisfaction, anxiety indicators) and qualitative postpartum notes.
• Purpose: Assisting the doula in identifying clients requiring emotional support or clinical referral.
• Lawful Basis: Explicit consent (GDPR Art 9(2)(a)). Note: This is an emotional check-in prompt, not a diagnostic medical instrument.

E. Children's & Newborn Data:
• Fields: Newborn time and date of birth, infant feeding method, newborn weight preferences, and developmental milestones.
• Purpose: Postpartum infant care support.
• Lawful Basis: Verifiable Parental Consent (DPDPA Sec 9 / GDPR Art 8 / COPPA) provided by the birthing parent upon intake.

F. Financial & Insurance Records:
• Fields: Agreed doula service fee, payment schedules (retainers and balance invoices), Medicaid beneficiary status, private insurance carrier names, claim adjudication statuses, and transaction receipts.
• Purpose: Practice bookkeeping, client invoicing, and insurance reimbursement tracking.
• Lawful Basis: Performance of a contract (GDPR Art 6(1)(b)) / Legal tax and accounting compliance.

G. Travel & Geolocation Data:
• Fields: Home visit client addresses and round-trip driving distances (kilometers/miles).
• Purpose: Tax-deductible travel expense tracking for practitioners.
• Lawful Basis: Legitimate interests of the practitioner for tax compliance (GDPR Art 6(1)(f)).`,
      },
      {
        id: "children",
        title: "4. Children's Data & Verifiable Parental Consent (DPDPA Sec 9 / GDPR Art 8)",
        content: `The Platform processes minimal personal data relating to newborns and infants solely in connection with perinatal doula support.
• Under Section 9 of the India DPDPA and Article 8 of the GDPR, processing personal data of a minor requires verifiable parental consent.
• When a birthing parent submits newborn birth details, feeding choices, or postpartum notes, they provide affirmative, verifiable parental consent acting as the lawful parent or legal guardian.
• We strictly prohibit any behavioral tracking, profiling, or targeted marketing directed at minors.`,
      },
      {
        id: "subprocessors",
        title: "5. Authorized Subprocessors & Third-Party Service Providers",
        content: `To deliver cloud-hosted workspace functionality, we engage trusted third-party subprocessors who are contractually bound under Data Processing Addenda (DPAs) meeting GDPR Article 28 and DPDPA obligations:

1. Supabase Inc. (Database, User Authentication, Document Storage)
• Headquarters: San Francisco, CA, USA.
• Infrastructure: Amazon Web Services (AWS) US-East & EU-Central regions.
• Function: Encrypted cloud database, user authentication sessions, and private document storage buckets.
• Safeguards: ISO 27001, SOC 2 Type II certified, TLS 1.3 in-transit encryption, AES-256 at-rest encryption, Row Level Security (RLS).

2. Resend Inc. (Transactional Email Delivery)
• Headquarters: San Francisco, CA, USA.
• Infrastructure: AWS US-East.
• Function: Delivering transactional email notices (appointment confirmations, completed intake packets, payment receipts).
• Safeguards: TLS 1.3 transit encryption, strict pre-compiled template allowlists, no arbitrary relay permitted.

3. Razorpay Software Pvt. Ltd. (Payment Gateway & Invoicing)
• Headquarters: Bangalore, Karnataka, India / Global.
• Infrastructure: AWS India / Singapore.
• Function: Processing online client payments, card transactions, UPI, and checkout payment links.
• Safeguards: PCI-DSS Level 1 certified, HMAC SHA-256 cryptographic webhook verification.

4. Google Fonts CDN (Google LLC)
• Function: Rendering typography assets (Plus Jakarta Sans, Cormorant Garamond).
• Note: Visitor IP addresses may be transmitted during browser font asset requests. Users may block external font requests via cookie/content settings.`,
      },
      {
        id: "crossborder",
        title: "6. International Cross-Border Data Transfers",
        content: `Personal data may be transferred to and stored on servers located outside the user's country of residence, including in the United States and the European Union.
• For transfers from the EU/EEA/UK to third countries lacking an adequacy decision, transfers are governed by the European Commission's Standard Contractual Clauses (SCCs, Implementing Decision (EU) 2021/914, Module 2 Controller-to-Processor and Module 3 Processor-to-Processor).
• For transfers from India under DPDPA Section 16, transfers are permitted to all countries not explicitly blacklisted by the Central Government of India.
• Supplementary technical safeguards, including Web Crypto 256-bit token authentication and AES-256 database storage encryption, protect data during cross-border transit.`,
      },
      {
        id: "retention",
        title: "7. Data Retention & Erasure Schedule",
        content: `We adhere to the principle of storage limitation (GDPR Art 5(1)(e) / DPDPA Sec 8(7)):
• Active Practice Data: Maintained during the term of the Practitioner's subscription or until an authorized erasure request is received.
• Client Health Records: Because perinatal and birth records are subject to statutory medical-legal liability limitation periods in many jurisdictions (often varying from 7 years up to 21 years following the child's age of majority), Practitioners are provided with automated full-archive export capabilities.
• Local Browser Cache: Clearing site data via browser settings or through the in-app "Clear Practice Data" button permanently removes un-synced local storage records.
• Financial & Tax Invoices: Retained for 7 fiscal years to satisfy statutory tax and financial accounting requirements.`,
      },
      {
        id: "rights",
        title: "8. Data Subject & Data Principal Rights (GDPR / DPDPA / CCPA)",
        content: `Individuals whose personal data is processed by the Platform enjoy statutory rights:
• Right to Access / Confirmation (GDPR Art 15 / DPDPA Sec 11 / CCPA Sec 1798.100): Obtain confirmation of processing and a machine-readable copy (JSON/ZIP) of all personal and health records.
• Right to Correction / Rectification (GDPR Art 16 / DPDPA Sec 12): Correct inaccurate, out-of-date, or incomplete records.
• Right to Erasure / Right to be Forgotten (GDPR Art 17 / DPDPA Sec 12 / CCPA Sec 1798.105): Request complete deletion of personal records, subject to statutory retention exceptions.
• Right to Restrict / Object to Processing (GDPR Arts 18, 21): Limit or object to specific processing workflows.
• Right to Withdraw Consent (GDPR Art 7(3) / DPDPA Sec 6(4)): Withdraw previously granted consent as easily as it was given.
• Right of Nominee Appointment (DPDPA Sec 14): Designate a nominee who may exercise data rights in the event of death or incapacity.
• California "Do Not Sell or Share" & GPC (CCPA / CPRA): We do NOT sell or share personal information for behavioral advertising. We automatically honor the Global Privacy Control (GPC) browser signal.

To exercise these rights, visit our interactive self-service portal at **#/data-request** or contact your Doula directly.`,
      },
      {
        id: "cookies",
        title: "9. Cookies, Local Storage & Tracking Disclosures",
        content: `We operate under a strict **Zero-Tracking-by-Default** philosophy:
• Strictly Necessary Storage: We use HTML5 Local Storage ('msc-doula-mvp-v1', 'msc_session') strictly to persist your offline practice workspace, active client sessions, and authentication credentials. These are essential for the software to operate.
• No Third-Party Tracking Cookies: We do not deploy third-party advertising cookies, cross-site tracking pixels, or marketing beacons (e.g., Meta Pixel, Google Analytics).
• Consent Manager: Non-essential functional storage preferences are managed through our built-in Consent Banner.`,
      },
      {
        id: "lawenforcement",
        title: "10. Law Enforcement & Government Data Requests",
        content: `We maintain strict procedural standards when responding to law enforcement or governmental requests:
• We will only disclose customer or client records in response to valid, legally binding process, such as a court warrant, subpoena, or statutory order issued by a court of competent jurisdiction.
• We review every request for procedural validity and overbreadth.
• We will notify the affected Practitioner and Client prior to disclosure unless strictly prohibited by court gag order or statutory emergency.`,
      },
      {
        id: "grievance",
        title: "11. India DPDPA Grievance Redressal & Designated Officers",
        content: `In compliance with Section 13 of the Digital Personal Data Protection Act, 2023:
• Any Data Principal with a grievance regarding processing of their personal data may submit a complaint directly via our Grievance Redressal mechanism at **#/data-request** or by emailing **grievance@maternalsupport.co**.
• Designated Grievance Officer: [REQUIRES HUMAN REVIEW: Name of Grievance Officer, Physical Office Address in India, Direct Email Contact].
• Grievance Response Timeline: We acknowledge complaints within 48 hours and provide a substantive resolution within 30 calendar days.
• Regulatory Escalation: If unsatisfied with our resolution, Data Principals have the statutory right to escalate their complaint to the **Data Protection Board of India (DPBI)**.

EU Data Protection Contact:
• Data Protection Officer (DPO): [REQUIRES HUMAN REVIEW: dpo@maternalsupport.co].
• EU Article 27 Representative: [REQUIRES HUMAN REVIEW: Insert designated EU representative details if applicable].
• Supervisory Authority Escalation: EU residents have the right to lodge a complaint with their local Data Protection Authority.`,
      },
    ],
  },

  terms: {
    id: "terms",
    title: "Terms of Service & Acceptable Use",
    subtitle: "Software License Agreement, Practitioner Terms, and Acceptable Use Policy",
    lastUpdated: "2026-09-25",
    sections: [
      {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: `These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "Practitioner", or "Client") and MaternalSupportCo Hub. By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, together with our Privacy Policy, Health Data Notice, and Medical Disclaimer.

If you are entering into these Terms on behalf of a birth practice, agency, or collective, you represent and warrant that you have full legal authority to bind such entity.`,
      },
      {
        id: "relationship",
        title: "2. Software Provider Role & Independent Doula Relationship",
        content: `• MaternalSupportCo Hub is a technology and software platform provider. We are NOT a healthcare provider, birth collective, medical clinic, hospital, or employer of doulas.
• Practitioners are independent professionals who use our software to manage their independent practices. We do not supervise, control, direct, or guarantee the quality, safety, legality, or clinical outcomes of any doula, birth, or postpartum services provided by Practitioners.
• Contracts, fee arrangements, service packages, and birth attendance commitments agreed between Practitioners and Clients are direct bilateral agreements to which MaternalSupportCo Hub is not a party.`,
      },
      {
        id: "acceptableuse",
        title: "3. Acceptable Use Policy (AUP)",
        content: `You agree to use the Platform strictly in compliance with all applicable laws and ethical birth support guidelines. You strictly agree NOT to:
• Use the Platform to provide, prescribe, diagnose, or administer clinical medical treatments, surgical advice, or prescription medications;
• Impersonate any licensed medical professional (OB/GYN, Certified Nurse Midwife, Registered Nurse) or misrepresent professional doula certifications;
• Upload, store, or transmit content that infringes any third party's intellectual property, privacy, or publicity rights;
• Attempt to circumvent, reverse engineer, probe, scan, or breach any security mechanism, authentication token, or Row Level Security (RLS) policy;
• Share user account credentials, magic access tokens, or API keys with unauthorized third parties;
• Use automated scrapers, spiders, or bots to harvest data from the Platform;
• Facilitate unauthorized electronic billing fraud or submit fraudulent reimbursement claims to Medicaid or private insurance carriers.`,
      },
      {
        id: "dpa",
        title: "4. Data Processing Terms (GDPR Article 28 / DPDPA)",
        content: `To the extent MaternalSupportCo Hub processes personal data on behalf of a Practitioner who acts as a Data Controller:
• Processor Instructions: We shall process Client personal data solely in accordance with the documented instructions of the Practitioner, including as necessary to provide workspace services.
• Confidentiality: All personnel authorized to access customer data are bound by strict statutory or contractual obligations of confidentiality.
• Security Safeguards: We implement and maintain appropriate technical and organizational measures as required by GDPR Article 32 and DPDPA Section 8.
• Subprocessor Notification: We shall inform the Practitioner of any intended changes concerning the addition or replacement of subprocessors, providing reasonable opportunity to object.
• Audit & Assistance: We will make available to the Practitioner all information necessary to demonstrate compliance with Article 28 obligations and assist with Data Subject Rights requests.
• Data Return & Deletion: Upon termination of services, at the choice of the Practitioner, we will delete or return all personal data, retaining copies only where required by statutory law.`,
      },
      {
        id: "fees",
        title: "5. Subscription Fees, Invoicing & Payments",
        content: `• Software Subscriptions: Practitioners pay subscription fees according to their selected tier. All fees are quoted in the designated currency and are non-refundable except where required by law.
• Client Billing Links: The Platform integrates with Razorpay to allow Practitioners to generate payment links for client retainers and balances. Practitioners are solely responsible for setting accurate service fees, defining refund/cancellation terms in their client service agreements, and remitting applicable local goods and services taxes (GST / VAT / Sales Tax).
• Chargebacks & Disputes: MaternalSupportCo Hub is not responsible for fee disputes, cancellations, or credit card chargebacks arising between Practitioners and Clients.`,
      },
      {
        id: "liability",
        title: "6. Limitation of Liability & Disclaimers",
        content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
• THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR UNINTERRUPTED ACCESSIBILITY.
• MATERNALSUPPORTCO HUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, DATA LOSS, REPUTATIONAL DAMAGE, OR PERINATAL/CLINICAL HEALTH OUTCOMES ARISING OUT OF OR IN CONNECTION WITH THE USE OF OUR SOFTWARE OR SERVICES PROVIDED BY PRACTITIONERS.
• OUR TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS SHALL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY YOU TO MATERNALSUPPORTCO HUB DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`,
      },
      {
        id: "governing",
        title: "7. Governing Law & Dispute Resolution",
        content: `[REQUIRES HUMAN REVIEW: Insert designated governing law jurisdiction, e.g., State of Delaware, United States; or Laws of India; or England & Wales].
• Any dispute, controversy, or claim arising out of or relating to these Terms shall be resolved first through good-faith informal negotiations within thirty (30) days.
• If unresolved, disputes shall be submitted to binding individual arbitration or the exclusive jurisdiction of the competent courts in the designated jurisdiction.`,
      },
    ],
  },

  "health-hipaa": {
    id: "health-hipaa",
    title: "Health Data, HIPAA & BAA Guide",
    subtitle: "Regulatory Analysis of HIPAA vs. FTC Health Breach Rule, Washington MHMDA, and BAA Execution Workflow",
    lastUpdated: "2026-09-25",
    sections: [
      {
        id: "hipaaScope",
        title: "1. Are Doulas Covered Entities under HIPAA?",
        content: `A critical legal question for modern birth workers is whether a doula is subject to the Health Insurance Portability and Accountability Act (HIPAA) (45 CFR Parts 160 and 164):

A. Independent Cash-Pay Doulas (Non-Covered):
• Doulas who provide non-clinical labor and postpartum support and accept direct payment from clients without transmitting standard electronic healthcare transactions (such as electronic claim submissions under 45 CFR Part 162) are generally **NOT HIPAA Covered Entities**.
• For non-covered birth workers, HIPAA privacy and security rules do not apply directly. Instead, their operations are governed by state consumer health privacy laws and the Federal Trade Commission (FTC).

B. Doulas Billing Insurance or Working in Covered Systems:
• When a doula bills Medicaid directly using an NPI (National Provider Identifier) via standard electronic HIPAA transaction formats, or operates as an integrated employee/contractor of a hospital or covered clinical collective, they **ARE a Covered Entity**.
• In such cases, HIPAA compliance is legally mandatory, and any cloud software storing Protected Health Information (PHI) must execute a valid Business Associate Agreement (BAA).`,
      },
      {
        id: "ftcHbnr",
        title: "2. The FTC Health Breach Notification Rule (HBNR) & State Laws",
        content: `Even when HIPAA does not directly apply, health, pregnancy, and reproductive data is subject to rigorous consumer protection regulation:

• FTC Health Breach Notification Rule (16 C.F.R. Part 318):
Under FTC regulations, non-HIPAA health applications that track identifiable health metrics (such as contractions, due dates, mental health scores, and birth events) must notify affected consumers, the FTC, and the media in the event of an unauthorized disclosure or security breach. Civil penalties exceed $50,000 per violation day.

• Washington My Health My Data Act (MHMDA) & Nevada SB 370:
These pioneering state laws classify pregnancy data, reproductive healthcare decisions, labor preferences, and postpartum wellness as protected "Consumer Health Data". They mandate:
1. Prior express opt-in consent before collecting or sharing consumer health data;
2. Strict prohibition against selling consumer health data;
3. Robust consumer rights to delete health data immediately upon request;
4. Private rights of action allowing consumers to sue for statutory damages.

MaternalSupportCo Hub enforces technical safeguards meeting these strict standards across all accounts regardless of HIPAA status.`,
      },
      {
        id: "baa",
        title: "3. Business Associate Agreement (BAA) Execution Workflow",
        content: `For Practitioners who operate as HIPAA Covered Entities (e.g., enrolled Medicaid providers submitting standard electronic claims):
• MaternalSupportCo Hub provides a standard, pre-approved HIPAA Business Associate Agreement (BAA).
• The BAA contractually guarantees that MaternalSupportCo Hub maintains administrative, technical, and physical safeguards in accordance with the HIPAA Security Rule (45 CFR §§ 164.308, 164.310, 164.312).
• To request execution of a BAA, contact **compliance@maternalsupport.co** with your practice legal name, NPI number, and billing jurisdiction.`,
      },
      {
        id: "clientAutonomy",
        title: "4. Client Rights, Informed Consent & Bodily Autonomy",
        content: `Birth work is founded on the fundamental human rights of bodily autonomy and informed choice:
• Non-Interference: A doula's role is to facilitate the client's own informed decision-making, never to substitute their judgment or speak on the client's behalf without explicit consent.
• Informed Refusal: Clients retain the inviolable legal right to give or withhold informed consent for any medical intervention (e.g., cervical exams, induction, epidural, continuous monitoring, episiotomy).
• Confidentiality of Birth Space: What transpires in the birth space is private. Doulas using our Platform are bound to uphold absolute confidentiality regarding labor events, family dynamics, and personal birth preferences.`,
      },
    ],
  },

  "security-ai": {
    id: "security-ai",
    title: "Security, AI Transparency & Vulnerability Disclosure",
    subtitle: "Technical Architecture Safeguards, Deterministic AI Disclosure, and Incident Response Protocols",
    lastUpdated: "2026-09-25",
    sections: [
      {
        id: "safeguards",
        title: "1. Technical & Architectural Safeguards",
        content: `We build security into the foundation of MaternalSupportCo Hub:
• Web Crypto API 256-bit Tokens: Client portal access links use high-entropy cryptographically secure random tokens ('tok_' + 24 secure bytes generated via window.crypto.getRandomValues), preventing token guessing or enumeration attacks.
• Strict Serverless Isolation: All API endpoints verify Supabase JWT bearer tokens or client portal tokens before fulfilling requests.
• Anti-Relay Email Security: Transactional email dispatch (/api/send-email) enforces recipient allowlists and compiles emails solely from pre-approved templates, preventing open email relay abuse.
• Fail-Closed Webhooks: Razorpay payment webhooks verify cryptographic signatures using HMAC SHA-256 with crypto.timingSafeEqual to eliminate timing attack vectors.
• Database Row Level Security (RLS): Supabase PostgreSQL tables enforce RLS policies ensuring doulas can only query their own client records. Database SECURITY DEFINER functions enforce isolated search paths ('SET search_path = public, pg_temp').
• Defense-in-Depth HTTP Headers: Content Security Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options: DENY, and X-Content-Type-Options: nosniff are enforced across all responses.`,
      },
      {
        id: "aiNotice",
        title: "2. AI Transparency & Ethics Notice (EU AI Act Art 50 / FTC Section 5)",
        content: `In compliance with Article 50 of the European Union Artificial Intelligence Act (Regulation (EU) 2024/1689) and FTC truth-in-advertising guidance regarding automated technology:

• Deterministic Template Heuristics:
The "Form Studio AI Generator" feature is a client-side keyword matching and template assembly engine. It matches the doula's prompt against a vetted library of standard doula practice field blocks (contact details, newborn basics, feeding preferences, sleep patterns, emotional wellbeing).

• No Third-Party LLM Data Leakage:
The generator runs ENTIRELY in your local web browser. It does NOT transmit your prompts, client records, or health data to OpenAI, Anthropic, Google Gemini, or any external large language model (LLM) API.

• Zero Automated Clinical Decision-Making:
The generator does NOT generate medical advice, diagnosis, or clinical protocols. All assembled forms are presented in an editable preview where the Practitioner must review, modify, and explicitly approve the fields before sending to any Client.`,
      },
      {
        id: "vulnerability",
        title: "3. Coordinated Vulnerability Disclosure & Safe Harbor",
        content: `We welcome responsible security research to ensure our community of birth workers and families remains secure.

• Scope: Our web application, API endpoints (/api/*), and Supabase integration.
• Reporting Process: If you discover a security vulnerability, email a detailed report to **security@maternalsupport.co**. Please include steps to reproduce, affected endpoints, and proof-of-concept payloads.
• Safe Harbor: We commit not to pursue legal action against researchers who:
  - Act in good faith to avoid privacy violations, data destruction, and service interruption;
  - Do not access, modify, or download data belonging to other users;
  - Provide reasonable time (at least 90 days) for us to remediate the issue prior to public disclosure;
  - Do not execute Denial of Service (DoS/DDoS) attacks, automated spamming, or social engineering.`,
      },
      {
        id: "incident",
        title: "4. Incident Response & 72-Hour Breach Notification Protocol",
        content: `We maintain a comprehensive Security Incident Response Plan (SIRP):
• Detection & Containment: Suspected security incidents trigger immediate containment, session revocation, and forensic log examination.
• 72-Hour GDPR Supervisory Notification: In the event of a personal data breach posing a risk to the rights and freedoms of individuals, we notify the competent Supervisory Authority within seventy-two (72) hours of becoming aware, in accordance with GDPR Article 33.
• Data Subject / Client Notification: Where a breach is likely to result in a high risk to individuals (GDPR Art 34 / DPDPA Sec 8(6) / FTC HBNR), we notify affected Practitioners and Clients without undue delay, providing remediation advice.`,
      },
    ],
  },

  "medical-disclaimer": {
    id: "medical-disclaimer",
    title: "Medical & Doula Services Disclaimer",
    subtitle: "Non-Clinical Scope of Practice, Emergency Instructions, and Crisis Resources",
    lastUpdated: "2026-09-25",
    sections: [
      {
        id: "nonclinical",
        title: "1. Strictly Non-Clinical Scope of Practice",
        content: `DOULAS ARE NON-CLINICAL SUPPORT PROFESSIONALS.

The information, templates, checklists, birth plans, contraction logs, and check-in tools provided on MaternalSupportCo Hub are designed solely for educational, organizational, physical, and emotional support purposes.

A doula does NOT:
• Provide medical care, clinical advice, or diagnosis;
• Perform clinical assessments (such as cervical exams, fetal heart rate diagnosis, or blood pressure interpretation);
• Prescribe medications, herbs, supplements, or medical procedures;
• Make medical decisions on behalf of the client or override the clinical recommendations of licensed obstetricians, midwives, or nursing staff;
• Catch or deliver babies except in sudden, unexpected emergency situations prior to the arrival of medical personnel.`,
      },
      {
        id: "noDoctorClient",
        title: "2. No Doctor-Patient or Clinical Relationship",
        content: `Use of MaternalSupportCo Hub does not create a doctor-patient, nurse-patient, or clinical midwifery relationship between you and MaternalSupportCo Hub, nor between the Doula and Client.

Always seek the advice of your licensed physician, obstetrician, certified nurse midwife, or other qualified healthcare provider with any questions you may have regarding a medical condition, pregnancy symptoms, labor progression, or postpartum recovery. Never disregard professional medical advice or delay seeking it because of something you have read or recorded on this Platform.`,
      },
      {
        id: "postpartumDisclaimer",
        title: "3. Postpartum Check-In & Mental Health Screening Disclaimer",
        content: `The postpartum check-in feature in this application contains conversational prompts to assist doulas in staying connected with new parents during weeks one to six following birth.

THIS FEATURE IS NOT A DIAGNOSTIC PSYCHIATRIC INSTRUMENT. It does not diagnose postpartum depression (PPD), postpartum anxiety (PPA), or postpartum psychosis. An in-app flag indicates only that the doula should reach out for a supportive conversation and encourage the client to consult their physician, midwife, or mental health professional.`,
      },
      {
        id: "emergencies",
        title: "4. Immediate Medical Emergencies & Crisis Hotlines",
        content: `IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, SEVERE PAIN, HEAVY VAGINAL BLEEDING, FLUID LEAKAGE, HIGH FEVER, SEVERE HEADACHE WITH VISION CHANGES, OR REDUCED FETAL MOVEMENT:
IMMEDIATELY CALL YOUR CARE PROVIDER, GO TO THE NEAREST HOSPITAL EMERGENCY ROOM / LABOR & DELIVERY UNIT, OR CALL EMERGENCY SERVICES (911 in the US/Canada, 112 in Europe/India, 999 in the UK).

IF YOU ARE EXPERIENCING THOUGHTS OF HARMING YOURSELF OR YOUR BABY:
• In the United States & Canada: Call or text **988** to reach the Suicide & Crisis Lifeline (available 24/7, free and confidential).
• National Maternal Mental Health Hotline (US): Call or text **1-833-TLC-MAMA (1-833-852-6262)**.
• In the United Kingdom: Call **111** or text SHOUT to **85258**.
• In India: Call **Vandrevala Foundation** at **+91 9999 666 555** or **KIRAN** at **1800-599-0019**.
• International: Reach out to your local emergency medical service immediately.`,
      },
    ],
  },
};
