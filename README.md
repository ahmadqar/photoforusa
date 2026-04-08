# PhotoForUSA

A Cloudflare Pages + Functions starter for a monetizable U.S. green card / visa-style photo website.

## Included features

- Modern responsive landing page
- Auto language suggestion by visitor country + manual language switcher
- Core UI translations for: English, Arabic, Spanish, French, Turkish, Russian, Portuguese, Hindi, Urdu, Chinese
- Cloudflare Turnstile human verification
- AI face detection with MediaPipe
- 600×600 JPEG export with compression toward 240 KB
- Premium background removal via remove.bg
- Lemon Squeezy Checkout payment flow
- Signed browser cookies for human and premium sessions
- SEO landing structure, FAQ schema, guide pages, sitemap, robots, manifest
- Ad placeholders (top, inline, sidebar, footer)

## Important truth about multilingual support

This starter includes major languages, not every world language. The architecture is ready to add more by extending `js/translations.js`.

## Cloudflare deployment

Use **Workers & Pages > Create > Pages > Direct Upload** or Git integration.

### Required environment variables

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET`
- `SESSION_SECRET`
- `PUBLIC_BASE_URL`

### Premium environment variables

- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_VARIANT_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET` (recommended for webhook verification)
- `REMOVEBG_API_KEY`

## Recommended test values

Cloudflare provides public Turnstile test keys for development:

- Site key: `1x00000000000000000000AA`
- Secret key: `1x0000000000000000000000000000000AA`

## Go-live checklist

1. Replace `https://PhotoForUSA.com` in canonical tags, sitemap, robots, and metadata with your real domain.
2. Replace the placeholder AdSense publisher ID in `ads.txt`.
3. Add your business name, support email, and refund policy to `privacy.html` and `terms.html`.
4. Add real Lemon Squeezy price IDs and webhook secret.
5. Consider adding Cloudflare D1 or KV if you want premium entitlements to persist across devices.
6. Connect Search Console and analytics after launch.

## Notes

- `functions/api/lemon-webhook.js` verifies webhook signatures and returns a confirmation response. Extend it with D1 or KV if you need persistent order fulfillment.
- Premium activation in this starter is browser-based and happens on `success.html` after Lemon Squeezy confirms payment.
