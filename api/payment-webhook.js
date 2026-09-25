import crypto from 'crypto';
import { safeCompare, isValidUuid } from './_auth.js';

/**
 * Enterprise Payment Webhook Handler
 * Endpoint: POST /api/payment-webhook
 * Protections: Fail-Closed Signature Enforcement, Constant-Time Hash Equality, Replay Attack Prevention, UUID Filter Sanitization
 */

// Cache of processed webhook event IDs to prevent replay attacks (evicted after 1 hour)
const PROCESSED_EVENTS = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const eventId = req.headers['x-razorpay-event-id'];

  // 1. Enforce Webhook Secret Configuration & Signature Header (Fail-Closed)
  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[api/payment-webhook] Security Error: RAZORPAY_WEBHOOK_SECRET is not configured.');
      return res.status(500).json({ error: 'Webhook processing unavailable' });
    } else {
      console.warn('[api/payment-webhook] RAZORPAY_WEBHOOK_SECRET not set in dev/test.');
    }
  }

  if (!signature || typeof signature !== 'string') {
    console.warn('[api/payment-webhook] Rejected request: Missing or invalid x-razorpay-signature header.');
    return res.status(401).json({ error: 'Unauthorized: Missing webhook signature' });
  }

  // 2. Validate HMAC SHA-256 signature using constant-time comparison
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret || 'dummy_secret')
    .update(rawBody)
    .digest('hex');

  if (!safeCompare(signature, expectedSignature)) {
    console.error('[api/payment-webhook] Security Alert: Webhook signature mismatch.');
    return res.status(401).json({ error: 'Unauthorized: Signature verification failed' });
  }

  // 3. Replay attack prevention: verify unique event ID
  if (eventId) {
    const now = Date.now();
    if (PROCESSED_EVENTS.has(eventId)) {
      console.warn(`[api/payment-webhook] Ignored duplicate/replayed event ID: ${eventId}`);
      return res.status(200).json({ status: 'ignored_duplicate' });
    }
    PROCESSED_EVENTS.set(eventId, now);
    // Cleanup old events
    if (PROCESSED_EVENTS.size > 2000) {
      for (const [id, ts] of PROCESSED_EVENTS.entries()) {
        if (now - ts > 3600000) PROCESSED_EVENTS.delete(id);
      }
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  console.log('[api/payment-webhook] Verified signature for event:', event);

  // 4. Handle successful payments
  if (event === 'payment_link.paid' || event === 'payment.captured') {
    const paymentEntity = payload?.payment_link?.entity || payload?.payment?.entity;
    const rawInvoiceId = paymentEntity?.notes?.invoice_id;

    // Validate invoice ID format strictly before querying PostgREST to prevent parameter injection
    if (!rawInvoiceId || !isValidUuid(rawInvoiceId)) {
      console.warn('[api/payment-webhook] Rejected payment event: Invalid or missing invoice ID format in notes.');
      return res.status(200).json({ status: 'ok', warning: 'invalid_invoice_id' });
    }

    const safeInvoiceId = encodeURIComponent(rawInvoiceId.trim());

    if (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const updateUrl = `${process.env.VITE_SUPABASE_URL}/rest/v1/invoices?id=eq.${safeInvoiceId}`;
        const patchRes = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            status: 'paid',
            paid_at: new Date().toISOString(),
          }),
        });

        if (!patchRes.ok) {
          console.error('[api/payment-webhook] Supabase update returned status:', patchRes.status);
        } else {
          console.log(`[api/payment-webhook] Successfully marked invoice ${safeInvoiceId} as paid`);
        }
      } catch (err) {
        console.error('[api/payment-webhook] Failed to update invoice in Supabase:', err);
      }
    }
  }

  return res.status(200).json({ status: 'ok' });
}
