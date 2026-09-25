import { checkRateLimit, getClientIp, verifySupabaseAuth, isValidUuid } from './_auth.js';

/**
 * Enterprise Hardened Payment Link Generator
 * Endpoint: POST /api/create-payment-link
 * Protections: Caller Authentication, IP Rate Limiting, Subunit Overflow Protection, Whitelist Currency Validation
 */

const ALLOWED_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']);
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Enforce IP rate limiting (max 10 link generations per minute)
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(clientIp, 'create-payment-link', 10, 60000);
  if (!rate.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  // 2. Enforce Doula Authentication
  const auth = await verifySupabaseAuth(req);
  if (!auth.authenticated) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_AUTH !== 'true') {
      return res.status(401).json({ error: 'Unauthorized: Valid Doula session required' });
    }
  }

  const {
    invoiceId,
    amount,
    currency = 'USD',
    customerName,
    customerEmail,
    customerPhone,
    description,
  } = req.body || {};

  // 3. Input Validation & Numeric Bounds Checking
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 50000) {
    return res.status(400).json({ error: 'Invalid amount. Must be between 0.01 and 50,000.00' });
  }

  const normalizedCurrency = String(currency || 'USD').toUpperCase().trim();
  if (!ALLOWED_CURRENCIES.has(normalizedCurrency)) {
    return res.status(400).json({ error: `Unsupported currency. Allowed: ${[...ALLOWED_CURRENCIES].join(', ')}` });
  }

  if (invoiceId && !isValidUuid(invoiceId)) {
    return res.status(400).json({ error: 'Invalid invoice ID format.' });
  }

  const cleanName = customerName ? String(customerName).replace(/<[^>]*>?/gm, '').trim().slice(0, 100) : 'Valued Client';
  const cleanEmail = customerEmail && EMAIL_REGEX.test(String(customerEmail).trim()) ? String(customerEmail).trim().toLowerCase() : undefined;
  const cleanPhone = customerPhone ? String(customerPhone).replace(/[^0-9+]/g, '').slice(0, 16) : undefined;
  const cleanDescription = description
    ? String(description).replace(/<[^>]*>?/gm, '').trim().slice(0, 200)
    : `MaternalSupportCo Doula Services - Invoice #${invoiceId ? String(invoiceId).slice(0, 8) : ''}`;

  const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

  // Fallback in dev/preview if Razorpay credentials not yet configured
  if (!rzpKeyId || !rzpKeySecret) {
    console.warn('[api/create-payment-link] Razorpay credentials not configured. Generating simulated link.');
    const simulatedLink = `https://rzp.io/i/demo_${invoiceId ? String(invoiceId).slice(0, 8) : Math.random().toString(36).substring(7)}`;
    return res.status(200).json({
      success: true,
      payment_link: simulatedLink,
      simulated: true,
      message: 'Payment link simulated (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set in environment).',
    });
  }

  try {
    const amountInSubunits = Math.round(numericAmount * 100);
    const authHeader = 'Basic ' + Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency: normalizedCurrency,
        accept_partial: false,
        description: cleanDescription,
        customer: {
          name: cleanName,
          email: cleanEmail,
          contact: cleanPhone,
        },
        notify: {
          sms: Boolean(cleanPhone),
          email: Boolean(cleanEmail),
        },
        reminder_enable: true,
        notes: {
          invoice_id: invoiceId ? String(invoiceId) : '',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({
      success: true,
      payment_link: data.short_url,
      payment_link_id: data.id,
    });
  } catch (err) {
    console.error('[api/create-payment-link] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
