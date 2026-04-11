import { json, error } from '../_lib/http.js';
import { verifyLemonSignature } from '../_lib/security.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.text();
  if (!env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured.', 500);
  }

  const signature = request.headers.get('X-Signature') || '';
  const ok = await verifyLemonSignature(body, signature, env.LEMONSQUEEZY_WEBHOOK_SECRET);
  if (!ok) return error('Invalid Lemon Squeezy webhook signature.', 400);

  const event = JSON.parse(body || '{}');
  return json({ received: true, event: event?.meta?.event_name || 'unknown' });
}
