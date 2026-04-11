import { json } from '../_lib/http.js';
import { getSessionState } from '../_lib/security.js';

const localeByCountry = {
  JO: 'ar', SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', EG: 'ar', IQ: 'ar',
  US: 'en', GB: 'en', CA: 'en', AU: 'en',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es',
  FR: 'fr', BE: 'fr', MA: 'fr', DZ: 'fr',
  TR: 'tr',
  RU: 'ru',
  BR: 'pt', PT: 'pt',
  IN: 'hi',
  PK: 'ur',
  CN: 'zh', TW: 'zh'
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const session = await getSessionState(request, env);
  const cfCountry = request.cf?.country || request.headers.get('CF-IPCountry') || '';
  const acceptLanguage = request.headers.get('accept-language') || 'en';
  const suggestedLocale = localeByCountry[cfCountry] || acceptLanguage.slice(0, 2) || 'en';

  return json({
    suggestedLocale,
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || '',
    premiumActive: session.premiumActive,
    humanVerified: session.humanVerified
  });
}
