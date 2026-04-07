# PhotoForUSA.com Deployment Checklist

## Canonical production domain
Use:
- https://PhotoForUSA.com

Redirect these to the apex domain:
- https://www.PhotoForUSA.com
- https://<your-project>.pages.dev

## Cloudflare Pages
1. Create or open your Pages project.
2. Upload the project or connect Git.
3. Add custom domains:
   - PhotoForUSA.com
   - www.PhotoForUSA.com
4. Set environment variables in Production:
   - TURNSTILE_SITE_KEY
   - TURNSTILE_SECRET
   - SESSION_SECRET
   - STRIPE_SECRET_KEY
   - STRIPE_PRICE_ID
   - PUBLIC_BASE_URL=https://PhotoForUSA.com
   - REMOVEBG_API_KEY
   - STRIPE_WEBHOOK_SECRET

## Stripe
- Product name: PhotoForUSA Premium
- Suggested price: $4.99 monthly or one-time starter offer
- Success URL: https://PhotoForUSA.com/success.html?session_id={CHECKOUT_SESSION_ID}
- Cancel URL: https://PhotoForUSA.com/#pricing
- Webhook endpoint: https://PhotoForUSA.com/api/stripe-webhook

## Redirects
Create redirects so that:
- www.PhotoForUSA.com/* -> https://PhotoForUSA.com/$1 (301)
- <project>.pages.dev/* -> https://PhotoForUSA.com/$1 (301)

## Ads
Replace placeholder ad blocks with your real network code:
- header billboard
- in-content rectangle
- sidebar skyscraper
- footer banner

## Final checks
- Test upload flow
- Test Turnstile verification
- Test face detection
- Test export file generation
- Test Stripe checkout
- Test premium background removal
- Test privacy/terms pages
- Submit sitemap to Google Search Console
