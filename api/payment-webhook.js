import crypto from 'crypto';

/**
 * Vercel Serverless Function: Payment Webhook Handler
 * Endpoint: POST /api/payment-webhook
 * Protected Secret: RAZORPAY_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (webhookSecret && signature) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[api/payment-webhook] Signature verification failed');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  console.log('[api/payment-webhook] Event received:', event);

  // When payment link is paid or payment captured
  if (event === 'payment_link.paid' || event === 'payment.captured') {
    const paymentEntity = payload?.payment_link?.entity || payload?.payment?.entity;
    const invoiceId = paymentEntity?.notes?.invoice_id;

    if (invoiceId && process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const updateUrl = `${process.env.VITE_SUPABASE_URL}/rest/v1/invoices?id=eq.${invoiceId}`;
        await fetch(updateUrl, {
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
        console.log(`[api/payment-webhook] Successfully marked invoice ${invoiceId} as paid`);
      } catch (err) {
        console.error('[api/payment-webhook] Failed to update invoice in Supabase:', err);
      }
    }
  }

  return res.status(200).json({ status: 'ok' });
}
