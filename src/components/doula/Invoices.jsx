import { useState } from "react";
import { motion } from "motion/react";
import { PageHead, Card, Empty, Field, MetricRibbon, MetricCard, StatusBadge, CopyButton } from "../ui.jsx";
import { IconInvoices, IconCheck, IconPlus, IconSparkles } from "../icons.jsx";
import { today, fmt, uid } from "../../lib/date.js";
import { formatMoney, currencySymbol } from "../../lib/currency.js";
import { SPRINGS } from "../motion/MotionPrimitives.jsx";

export default function Invoices({ db, up, toast }) {
  const curr = db.currency || "USD";
  const sym = currencySymbol(curr);
  const [creating, setCreating] = useState(false);
  const [loadingLink, setLoadingLink] = useState(null);
  const [f, setF] = useState({
    clientId: db.clients[0]?.id || "",
    amount: 500,
    description: "Doula Services Retainer",
  });

  const invoices = db.invoices || [];

  // Financial summary metrics
  const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalPending = totalBilled - totalPaid;

  const handleCreate = async () => {
    if (!f.clientId) return toast("Please select a client");
    if (!f.amount || Number(f.amount) <= 0) return toast("Enter a valid amount");

    const client = db.clients.find((c) => c.id === f.clientId);
    const invoiceId = uid();

    // Call serverless endpoint to generate payment link
    let paymentLink = "";
    try {
      const res = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          amount: Number(f.amount),
          currency: curr,
          customerName: client?.name,
          customerEmail: client?.email,
          customerPhone: client?.phone,
          description: f.description,
        }),
      });
      const data = await res.json();
      if (data?.payment_link) {
        paymentLink = data.payment_link;
      }
    } catch (e) {
      console.warn("Payment link generation fallback:", e);
    }

    const newInvoice = {
      id: invoiceId,
      clientId: f.clientId,
      amount: Number(f.amount),
      currency: curr,
      description: f.description,
      status: paymentLink ? "sent" : "draft",
      paymentLink,
      paymentMethod: "Razorpay / PayPal",
      createdAt: today(),
      paidAt: null,
    };

    up((d) => ({
      invoices: [newInvoice, ...(d.invoices || [])],
    }));

    setCreating(false);
    toast(paymentLink ? "Invoice created with live payment link" : "Invoice created");
  };

  const handleGenerateLink = async (inv) => {
    setLoadingLink(inv.id);
    const client = db.clients.find((c) => c.id === inv.clientId);

    try {
      const res = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: inv.id,
          amount: inv.amount,
          currency: inv.currency || curr,
          customerName: client?.name,
          customerEmail: client?.email,
          customerPhone: client?.phone,
          description: inv.description,
        }),
      });
      const data = await res.json();
      if (data?.payment_link) {
        up((d) => ({
          invoices: d.invoices.map((x) =>
            x.id === inv.id ? { ...x, paymentLink: data.payment_link, status: "sent" } : x
          ),
        }));
        navigator.clipboard.writeText(data.payment_link);
        toast("Payment link generated and copied to clipboard!");
      }
    } catch (err) {
      toast("Could not generate payment link");
    } finally {
      setLoadingLink(null);
    }
  };

  const markPaid = (invId) => {
    up((d) => ({
      invoices: (d.invoices || []).map((x) =>
        x.id === invId ? { ...x, status: "paid", paidAt: today() } : x
      ),
    }));
    toast("Invoice marked as paid");
  };

  return (
    <>
      <PageHead
        eyebrow="Financial Management"
        title="Invoices"
        sub="Create client invoices, generate instant payment links, and track receipts."
        action={
          <button className="primary" onClick={() => setCreating(!creating)}>
            {creating ? "Cancel" : "+ Create new invoice"}
          </button>
        }
      />

      {/* Financial KPI Summary */}
      <MetricRibbon cols={3}>
        <MetricCard
          title="Total Invoiced"
          value={formatMoney(totalBilled, curr)}
          sub={`${invoices.length} invoices generated`}
          icon={IconInvoices}
          variant="default"
        />
        <MetricCard
          title="Collected Revenue"
          value={formatMoney(totalPaid, curr)}
          sub="Settled to bank"
          icon={IconCheck}
          variant="ok"
          badge="Received"
        />
        <MetricCard
          title="Pending Receivables"
          value={formatMoney(totalPending, curr)}
          sub={totalPending > 0 ? "Awaiting client checkout" : "All payments settled"}
          icon={IconSparkles}
          variant={totalPending > 0 ? "warn" : "ok"}
          badge={totalPending > 0 ? "Outstanding" : "Clear"}
        />
      </MetricRibbon>

      {creating && (
        <Card title="Generate Client Invoice" spotlight>
          <div className="fgrid">
            <Field label="Client" required>
              <select
                value={f.clientId}
                onChange={(e) => setF({ ...f, clientId: e.target.value })}
              >
                <option value="">Select client...</option>
                {db.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || c.email || "No contact"})
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`Amount (${curr} ${sym})`} required>
              <input
                type="number"
                min="1"
                value={f.amount}
                onChange={(e) => setF({ ...f, amount: e.target.value })}
                placeholder="500"
              />
            </Field>
          </div>

          <Field label="Service description">
            <input
              type="text"
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              placeholder="e.g. Birth Doula Package Retainer"
            />
          </Field>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
            <button className="primary" onClick={handleCreate}>
              Save invoice & generate payment link
            </button>
            <span className="hint">
              Generates a secure checkout link ready to send to the client.
            </span>
          </div>
        </Card>
      )}

      <div style={{ marginTop: 20 }}>
        {invoices.length === 0 && (
          <Empty icon={IconInvoices}>
            No invoices created yet. Click "+ Create invoice" to bill your first client.
          </Empty>
        )}
        <div className="cardgrid">
          {invoices.map((inv) => {
            const client = db.clients.find((c) => c.id === inv.clientId);
            const isPaid = inv.status === "paid";
            const initials = client?.name
              ? client.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0].toUpperCase())
                  .join("")
              : "CL";

            return (
              <motion.div
                className="invoice-card"
                key={inv.id}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={SPRINGS.tactile}
              >
                <div className="invoice-top">
                  <div className="invoice-client-row">
                    <div className="client-avatar small">{initials}</div>
                    <div>
                      <div className="invoice-client-name">{client ? client.name : "Valued Client"}</div>
                      <div className="invoice-date">{inv.createdAt ? fmt(inv.createdAt) : "Recent"}</div>
                    </div>
                  </div>
                  <StatusBadge status={isPaid ? "paid" : inv.status || "draft"} />
                </div>

                <div className="invoice-amount-row">
                  <div className="invoice-amount-big">
                    {formatMoney(inv.amount, inv.currency || curr)}
                  </div>
                  <div className="invoice-desc">{inv.description}</div>
                </div>

                <div className="invoice-actions">
                  {isPaid ? (
                    <div className="paid-stamp">
                      <IconCheck size={14} /> Paid on {fmt(inv.paidAt || inv.createdAt)}
                    </div>
                  ) : (
                    <>
                      {inv.paymentLink ? (
                        <CopyButton text={inv.paymentLink} label="Copy Payment Link" copiedLabel="Link Copied!" className="wide" />
                      ) : (
                        <button
                          type="button"
                          className="ghost wide"
                          disabled={loadingLink === inv.id}
                          onClick={() => handleGenerateLink(inv)}
                        >
                          {loadingLink === inv.id ? "Generating..." : "⚡ Generate Payment Link"}
                        </button>
                      )}

                      <button
                        type="button"
                        className="primary wide"
                        style={{ marginTop: 8 }}
                        onClick={() => markPaid(inv.id)}
                      >
                        ✓ Mark as Paid
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
