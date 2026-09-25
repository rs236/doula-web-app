/**
 * Vercel Serverless Function: Send Transactional Email via Resend
 * Endpoint: POST /api/send-email
 * Protected Secret: RESEND_API_KEY (Process Environment only, never exposed to client)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[api/send-email] RESEND_API_KEY not configured. Simulating email dispatch.');
    return res.status(200).json({ simulated: true, message: 'Email logged in dev mode (RESEND_API_KEY not set).' });
  }

  const { to, subject, html, text } = req.body || {};

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'Missing required parameters: to, subject, html or text' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MaternalSupportCo Hub <hub@maternalsupportco.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || undefined,
        text: text || undefined,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[api/send-email] Dispatch failed:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
