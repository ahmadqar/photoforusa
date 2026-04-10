import { json, error } from '../_lib/http.js';
import { setSignedCookie } from '../_lib/security.js';

async function fetchJson(url, apiKey) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`
    }
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { orderId } = await request.json().catch(() => ({}));
  if (!orderId) return error('Missing Lemon Squeezy order ID.');

  if (!env.LEMONSQUEEZY_API_KEY || !env.LEMONSQUEEZY_STORE_ID || !env.LEMONSQUEEZY_VARIANT_ID) {
    return error('Lemon Squeezy environment variables are incomplete.', 500);
  }

  const { response: orderResponse, data: orderData } = await fetchJson(`https://api.lemonsqueezy.com/v1/orders/${encodeURIComponent(orderId)}`, env.LEMONSQUEEZY_API_KEY);
  if (!orderResponse.ok) {
    return error(orderData?.errors?.[0]?.detail || 'Could not verify the Lemon Squeezy order.', 500);
  }

  const order = orderData?.data;
  if (!order || String(order?.attributes?.store_id) !== String(env.LEMONSQUEEZY_STORE_ID)) {
    return error('Order does not belong to this store.', 403);
  }

  const { response: itemsResponse, data: itemsData } = await fetchJson(`https://api.lemonsqueezy.com/v1/order-items?filter[order_id]=${encodeURIComponent(orderId)}`, env.LEMONSQUEEZY_API_KEY);
  if (!itemsResponse.ok) {
    return error(itemsData?.errors?.[0]?.detail || 'Could not verify the purchased item.', 500);
  }

  const matchesPremium = Array.isArray(itemsData?.data) && itemsData.data.some((item) => String(item?.attributes?.variant_id) === String(env.LEMONSQUEEZY_VARIANT_ID));
  if (!matchesPremium) {
    return error('This order does not include the Premium variant.', 403);
  }

  const headers = new Headers();
  await setSignedCookie(headers, 'premium_session', { ok: true, oid: orderId, provider: 'lemon' }, env.SESSION_SECRET || 'dev-session-secret-change-me', 60 * 60 * 24 * 30);
  return json({ premiumActive: true, provider: 'lemon' }, { headers });
}
