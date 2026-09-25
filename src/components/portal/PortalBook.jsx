import { useState } from "react";
import { PageHead, Empty } from "../ui.jsx";
import { today, fmt, uid } from "../../lib/date.js";
import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";

export default function PortalBook({ db, up, c, toast, doula = {} }) {
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const open = (db.slots || [])
    .filter((s) => !s.clientId && s.date >= today())
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));

  const handleBook = async (s) => {
    setBookingInProgress(true);
    const token = c?.access_token || c?.accessToken;

    // 1. Supabase booking RPC if configured
    if (isSupabaseConfigured && token) {
      try {
        const slotIso = new Date(`${s.date}T${s.time}:00`).toISOString();
        const bookingType = (s.type || "prenatal").toLowerCase().includes("postpartum")
          ? "postpartum"
          : (s.type || "").toLowerCase().includes("labor")
          ? "labor"
          : "prenatal";

        await supabase.rpc("book_client_slot", {
          p_token: token,
          p_slot_time: slotIso,
          p_type: bookingType,
          p_notes: `Mode: ${s.mode || "In person"}`,
        });
      } catch (err) {
        console.warn("Supabase book_client_slot fallback:", err);
      }
    }

    // 2. Update local state
    up((d) => ({
      slots: d.slots.filter((x) => x.id !== s.id),
      appts: [
        ...(d.appts || []),
        { id: uid(), clientId: c.id, date: s.date, time: s.time, type: s.type, mode: s.mode, note: "" },
      ],
    }));

    // 3. Send booking confirmation email to both client and doula via serverless function
    const dateFormatted = fmt(s.date);
    const visitDetails = `${s.type} on ${dateFormatted} at ${s.time} (${s.mode || "In person"})`;

    // To client
    if (c.email) {
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: c.email,
          subject: `Visit Confirmed: ${visitDetails}`,
          text: `Hi ${c.name},\n\nYour visit has been confirmed:\n${visitDetails}\n\nWe look forward to supporting you!\n— ${doula.business_name || "Your Doula"}`,
        }),
      }).catch((e) => console.log("Email dispatch skipped:", e));
    }

    // To doula
    if (doula.email) {
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: doula.email,
          subject: `New Client Booking: ${c.name} - ${visitDetails}`,
          text: `Great news! ${c.name} has booked an appointment:\n\n${visitDetails}\nClient contact: ${c.phone || c.email || "See portal"}`,
        }),
      }).catch((e) => console.log("Email dispatch skipped:", e));
    }

    toast("Appointment booked! Confirmation has been sent.");
    setBookingInProgress(false);
  };

  return (
    <>
      <PageHead
        eyebrow="Choose a time"
        title="Book a visit"
        sub="These are the times I'm actually free. Pick one and it's confirmed."
      />
      {open.length === 0 && <Empty>No open times right now. Please message your doula directly.</Empty>}
      <div className="cardgrid">
        {open.map((s) => (
          <div className="slotcard" key={s.id}>
            <div className="slotdate">{fmt(s.date)}</div>
            <div className="slottime">{s.time}</div>
            <div className="slotmeta">
              {s.type} · {s.mode}
            </div>
            <button
              className="primary wide"
              disabled={bookingInProgress}
              onClick={() => handleBook(s)}
            >
              {bookingInProgress ? "Booking..." : "Book this visit"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
