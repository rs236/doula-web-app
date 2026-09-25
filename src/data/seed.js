import { today, addDays, uid } from "../lib/date.js";
import { PACKET, formById } from "./forms.js";
import { seedFormStudio } from "./customForms.js";

/* Demo practice. Dates are relative to first load so the on-call board
   is always live, whenever someone opens the app. */
export function seed() {
  const t = today();

  const clients = [
    {
      id: "c1",
      name: "Priya Menon",
      phone: "+1 415 555 0122",
      edd: addDays(t, 11),
      status: "On-call",
      provider: "Dr. Nair — UCSF Birth Center",
      birthplace: "UCSF Birth Center, San Francisco",
      package: "Full Birth Support",
      fee: 2000,
      backupId: "b1",
      partner: "Arjun",
      emergency: "Arjun Menon +1 415 555 0123",
    },
    {
      id: "c2",
      name: "Hannah Weiss",
      phone: "+1 415 555 0148",
      edd: addDays(t, 63),
      status: "Booked",
      provider: "Midwifery Collective",
      birthplace: "Home birth",
      package: "Birth + 2 Postpartum Visits",
      fee: 2400,
      backupId: "b2",
      partner: "Dana",
      emergency: "Dana Weiss +1 415 555 0177",
    },
    {
      id: "c3",
      name: "Aditi Raghavan",
      phone: "+1 415 555 0188",
      edd: addDays(t, -19),
      status: "Postpartum",
      provider: "Dr. Iyer",
      birthplace: "CPMC Mission Bernal",
      package: "Full Birth Support",
      fee: 2000,
      backupId: "b1",
      partner: "Rohit",
      emergency: "Rohit R +1 415 555 0189",
    },
  ];

  const appts = [
    {
      id: uid(),
      clientId: "c1",
      date: addDays(t, 1),
      time: "10:30",
      type: "Prenatal Visit 3",
      mode: "In person",
      note: "Final prep, comfort measures practice",
    },
    {
      id: uid(),
      clientId: "c2",
      date: addDays(t, 4),
      time: "17:00",
      type: "Prenatal Visit 1",
      mode: "Video",
      note: "",
    },
    {
      id: uid(),
      clientId: "c3",
      date: addDays(t, 2),
      time: "11:00",
      type: "Postpartum Visit",
      mode: "In person",
      note: "Feeding check-in",
    },
  ];

  const slots = [
    { id: uid(), date: addDays(t, 3), time: "09:00", type: "Prenatal Visit", mode: "In person", clientId: null },
    { id: uid(), date: addDays(t, 3), time: "15:30", type: "Prenatal Visit", mode: "Video", clientId: null },
    { id: uid(), date: addDays(t, 6), time: "11:00", type: "Postpartum Visit", mode: "In person", clientId: null },
    { id: uid(), date: addDays(t, 8), time: "18:00", type: "Discovery Call", mode: "Video", clientId: null },
  ];

  const assigned = [];
  PACKET.forEach((fid) => {
    assigned.push({
      id: uid(),
      clientId: "c1",
      formId: fid,
      sentOn: addDays(t, -30),
      answers: {},
      signedOn: null,
      completedOn: null,
    });
    assigned.push({
      id: uid(),
      clientId: "c2",
      formId: fid,
      sentOn: addDays(t, -6),
      answers: {},
      signedOn: null,
      completedOn: null,
    });
  });

  // Priya has returned everything except her planning documents.
  assigned
    .filter((a) => a.clientId === "c1" && a.formId !== "ppplan" && a.formId !== "birthprefs")
    .forEach((a) => {
      a.completedOn = addDays(t, -28);
      a.answers = { __sig: "Priya Menon" };
      if (formById(a.formId).sign) a.signedOn = addDays(t, -28);
    });

  const payments = [
    { id: uid(), clientId: "c1", label: "Retainer (on booking)", amount: 800, dueWeek: 20, paidOn: addDays(t, -60) },
    { id: uid(), clientId: "c1", label: "Balance (by 36 weeks)", amount: 1200, dueWeek: 36, paidOn: null },
    { id: uid(), clientId: "c2", label: "Retainer (on booking)", amount: 900, dueWeek: 20, paidOn: addDays(t, -5) },
    { id: uid(), clientId: "c2", label: "Balance (by 36 weeks)", amount: 1500, dueWeek: 36, paidOn: null },
    { id: uid(), clientId: "c3", label: "Retainer (on booking)", amount: 800, dueWeek: 20, paidOn: addDays(t, -140) },
    { id: uid(), clientId: "c3", label: "Balance (by 36 weeks)", amount: 1200, dueWeek: 36, paidOn: addDays(t, -40) },
  ];

  const backups = [
    { id: "b1", name: "Reema Fernandes", phone: "+1 415 555 0162", area: "Bay Area / South Bay", note: "Certified, 6 yrs. Confirmed for Aug–Oct." },
    { id: "b2", name: "Kate Odume", phone: "+1 415 555 0190", area: "Bay Area / East Bay", note: "Home birth experience." },
  ];

  const studio = seedFormStudio();

  return {
    currency: "USD",
    clients,
    appts,
    slots,
    assigned: [...assigned, ...studio.assignments],
    payments,
    backups,
    customForms: studio.forms,
    logs: [],
    checkins: [
      {
        id: uid(),
        clientId: "c3",
        date: addDays(t, -5),
        scores: { mood: 2, sleep: 3, support: 1, feeding: 2, anxiety: 3 },
        note: "Feeding is going better this week.",
        flagged: true,
      },
    ],
    trips: [
      { id: uid(), date: addDays(t, -3), clientId: "c1", purpose: "Prenatal Visit 2", km: 18 },
      { id: uid(), date: addDays(t, -12), clientId: "c3", purpose: "Postpartum Visit", km: 26 },
    ],
    rate: 0.67,
  };
}
