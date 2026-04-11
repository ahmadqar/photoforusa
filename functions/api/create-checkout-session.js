import { json, error } from '../_lib/http.js';
import { getSessionState } from '../_lib/security.js';

const CHECKOUT_COLORS = {
  button_color: '#7047EB',
  button_text_color: '#ffffff',
  headings_color: '#e2e8f0',
  primary_text_color: '#e2e8f0',
  secondary_text_color: '#94a3b8',
  links_color: '#60a5fa',
  borders_color: '#23314d',
  checkbox_color: '#7047EB',
  active_state_color: '#7047EB',
  background_color: '#020617'
};

function mapCheckoutLocale(locale = 'en') {
  const base = locale.toLowerCase();
  if (base === 'zh') return 'zh-CN';
  const supported = new Set(['en','fr','de','es','pt','ru','tr']);
  return supported.has(base) ? base : 'en';
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const session = await getSessionState(request, env);
  if (!session.humanVerified) return error('Human verification is required before checkout.', 403);

  if (!env.LEMONSQUEEZY_API_KEY || !env.LEMONSQUEEZY_STORE_ID || !env.LEMONSQUEEZY_VARIANT_ID || !env.PUBLIC_BASE_URL) {
    return error('Lemon Squeezy environment variables are incomplete.', 500);
  }

  const browserToken = crypto.randomUUID();
  const locale = mapCheckoutLocale((request.headers.get('accept-language') || 'en').slice(0, 2));

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        product_options: {
          name: 'PhotoForUSA Premium',
          description: 'Premium tools for PhotoForUSA, including background removal and cleaner exports.',
          receipt_button_text: 'Return to PhotoForUSA',
         receipt_link_url: `${env.PUBLIC_BASE_URL}/success.html?order_id=[order_id]`,
          receipt_thank_you_note: 'Your Premium access is ready. Return to PhotoForUSA to continue editing.',
          enabled_variants: [Number(env.LEMONSQUEEZY_VARIANT_ID)]
        },
        checkout_options: {
          ...CHECKOUT_COLORS,
          discount: true,
          media: true,
          logo: true,
          desc: true,
          embed: true,
          locale
        },
        checkout_data: {
          custom: {
            browser_token: browserToken
          }
        }
      },
      relationships: {
        store: { data: { type: 'stores', id: String(env.LEMONSQUEEZY_STORE_ID) } },
        variant: { data: { type: 'variants', id: String(env.LEMONSQUEEZY_VARIANT_ID) } }
      }
    }
  };

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return error(data?.errors?.[0]?.detail || data?.error || 'Lemon checkout creation failed.', 500);
  }

  return json({
    id: data?.data?.id,
    url: data?.data?.attributes?.url || '',
    mode: 'lemon_overlay'
  });
}
