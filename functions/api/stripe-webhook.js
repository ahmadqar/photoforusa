import { json, error } from '../_lib/http.js';
import { verifyStripeSignature } from '../_lib/security.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.text();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return error('STRIPE_WEBHOOK_SECRET is not configured.', 500);
  }
  const ok = await verifyStripeSignature(body, request.headers.get('Stripe-Signature') || '', env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return error('Invalid Stripe webhook signature.', 400);

  const event = JSON.parse(body);
  return json({
    received: true,
    type: event.type,
    note: 'Webhook verified. Add KV or D1 storage if you want persistent entitlements across devices.'
  });
}
