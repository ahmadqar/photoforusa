import { json, error } from '../_lib/http.js';
import { getSessionState } from '../_lib/security.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const session = await getSessionState(request, env);
  if (!session.humanVerified) return error('Human verification is required before checkout.', 403);

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID || !env.PUBLIC_BASE_URL) {
    return error('Stripe environment variables are incomplete.', 500);
  }

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${env.PUBLIC_BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${env.PUBLIC_BASE_URL}/#pricing`);
  params.set('line_items[0][price]', env.STRIPE_PRICE_ID);
  params.set('line_items[0][quantity]', '1');
  params.set('allow_promotion_codes', 'true');
  params.set('billing_address_collection', 'auto');
  params.set('metadata[product]', 'premium-background-removal');
  params.set('metadata[source]', 'cloudflare-pages');

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data = await response.json();
  if (!response.ok) {
    return error(data?.error?.message || 'Stripe Checkout session creation failed.', 500);
  }

  return json({ id: data.id, url: data.url });
}
