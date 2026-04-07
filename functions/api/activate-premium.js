import { json, error } from '../_lib/http.js';
import { setSignedCookie } from '../_lib/security.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const { sessionId } = await request.json().catch(() => ({}));
  if (!sessionId) return error('Missing Stripe session_id.');

  if (!env.STRIPE_SECRET_KEY) {
    return error('STRIPE_SECRET_KEY is not configured.', 500);
  }

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  const data = await response.json();

  if (!response.ok) return error(data?.error?.message || 'Could not verify the Stripe session.', 500);
  if (data.payment_status !== 'paid' && data.status !== 'complete') {
    return error('Payment is not complete yet.', 403);
  }

  const headers = new Headers();
  await setSignedCookie(headers, 'premium_session', { ok: true, sid: sessionId }, env.SESSION_SECRET || 'dev-session-secret-change-me', 60 * 60 * 24 * 30);
  return json({ premiumActive: true }, { headers });
}
