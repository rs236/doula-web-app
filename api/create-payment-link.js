/**
 * Vercel Serverless Function: Create Payment Link (Razorpay / PayPal)
 * Endpoint: POST /api/create-payment-link
 * Protected Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (server-only)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { invoiceId, amount, currency = 'USD', customerName, customerEmail, customerPhone, description } = req.body || {};

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

  // Fallback if Razorpay is not yet configured: generate a simulated link or PayPal order
  if (!rzpKeyId || !rzpKeySecret) {
    console.warn('[api/create-payment-link] Razorpay credentials not configured. Generating placeholder link.');
    const simulatedLink = `https://rzp.io/i/demo_${invoiceId || Math.random().toString(36).substring(7)}`;
    return res.status(200).json({
      success: true,
      payment_link: simulatedLink,
      simulated: true,
      message: 'Payment link simulated. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel to activate live links.'
    });
  }

  try {
    // Razorpay standard Payment Links API
    // Amount must be in subunits (e.g. paise for INR, cents for USD)
    const amountInSubunits = Math.round(Number(amount) * 100);

    const authHeader = 'Basic ' + Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency: currency.toUpperCase(),
        accept_partial: false,
        description: description || `MaternalSupportCo Doula Services - Invoice #${invoiceId ? invoiceId.slice(0, 8) : ''}`,
        customer: {
          name: customerName || 'Valued Client',
          email: customerEmail || undefined,
          contact: customerPhone || undefined,
        },
        notify: {
          sms: !!customerPhone,
          email: !!customerEmail,
        },
        reminder_enable: true,
        notes: {
          invoice_id: invoiceId || '',
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
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
