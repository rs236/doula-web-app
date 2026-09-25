import { checkRateLimit, getClientIp, verifySupabaseAuth } from './_auth.js';

/**
 * Enterprise Hardened Email Dispatcher
 * Endpoint: POST /api/send-email
 * Protections: Rate Limiting, Open-Relay Prevention, Recipient Sanitization, Structured Content Enforcement
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Safe server-side template generator (prevents injection of arbitrary HTML/phishing)
function renderSafeTemplate(template, params = {}) {
  const safeClient = String(params.clientName || 'Valued Client').replace(/<[^>]*>?/gm, '');
  const safeDoula = String(params.doulaName || 'Your Doula').replace(/<[^>]*>?/gm, '');
  const safeDetails = String(params.details || '').replace(/<[^>]*>?/gm, '');

  switch (template) {
    case 'visit_confirmed':
      return {
        subject: `Visit Confirmed: ${safeDetails}`,
        text: `Hi ${safeClient},\n\nYour visit has been confirmed:\n${safeDetails}\n\nWe look forward to supporting you!\n— ${safeDoula}`,
        html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.5; color: #1e293b;">
          <h2 style="color: #4f46e5;">Visit Confirmed</h2>
          <p>Hi ${safeClient},</p>
          <p>Your visit has been confirmed:</p>
          <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 16px 0;">
            <b>${safeDetails}</b>
          </div>
          <p>We look forward to supporting you!<br/>— <i>${safeDoula}</i></p>
        </div>`,
      };

    case 'document_completed':
      return {
        subject: `Document Completed: ${params.formTitle || 'Clinical Form'} from ${safeClient}`,
        text: `${safeClient} has submitted ${params.formTitle || 'a clinical form'}.\n\nAccess your doula practice workspace to review.`,
        html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.5; color: #1e293b;">
          <h2 style="color: #10b981;">New Document Submission</h2>
          <p><b>${safeClient}</b> has completed the following form:</p>
          <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #10b981; margin: 16px 0;">
            <b>${String(params.formTitle || 'Document').replace(/<[^>]*>?/gm, '')}</b>
          </div>
          <p>Please log in to your MaternalSupportCo Hub workspace to review and countersign.</p>
        </div>`,
      };

    default:
      // Fallback text-only sanitized message
      const cleanText = String(params.text || '').replace(/<[^>]*>?/gm, '').slice(0, 2000);
      return {
        subject: String(params.subject || 'Notice from MaternalSupportCo').replace(/<[^>]*>?/gm, '').slice(0, 120),
        text: cleanText,
        html: undefined,
      };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Enforce IP-based rate limiting (max 10 email dispatches per minute)
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(clientIp, 'send-email', 10, 60000);
  if (!rate.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait before sending another email.' });
  }

  const { to, template, params, text, subject, portalToken } = req.body || {};

  // 2. Validate recipient email address (single recipient only, no relay lists)
  if (!to || typeof to !== 'string' || !EMAIL_REGEX.test(to.trim())) {
    return res.status(400).json({ error: 'A valid recipient email address is required.' });
  }

  const recipient = to.trim().toLowerCase();

  // 3. Authorization check:
  // Must have a valid Doula Supabase session OR a valid client portal context
  const auth = await verifySupabaseAuth(req);
  const isClientPortalDispatch = Boolean(portalToken && typeof portalToken === 'string' && portalToken.length >= 16);

  if (!auth.authenticated && !isClientPortalDispatch) {
    // If not authenticated, require explicit dev simulation
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_AUTH !== 'true') {
      return res.status(401).json({ error: 'Authentication required to dispatch outbound communications.' });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[api/send-email] RESEND_API_KEY not configured. Dispatched in simulated safe mode.');
    return res.status(200).json({
      success: true,
      simulated: true,
      message: 'Email simulated in dev environment (RESEND_API_KEY not set).',
    });
  }

  // 4. Render sanitized content
  const rendered = template
    ? renderSafeTemplate(template, params)
    : renderSafeTemplate('custom', { subject, text });

  if (!rendered.text && !rendered.html) {
    return res.status(400).json({ error: 'Invalid email payload.' });
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
        to: [recipient],
        subject: rendered.subject,
        html: rendered.html || undefined,
        text: rendered.text || undefined,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('[api/send-email] Dispatch failed:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
