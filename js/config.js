export const APP_CONFIG = {
  appName: 'PhotoForUSA',
  exportSize: 600,
  exportMime: 'image/jpeg',
  exportMaxBytes: 240 * 1024,
  defaultQuality: 0.92,
  minQuality: 0.46,
  qualityStep: 0.06,
  premiumDurationDays: 30,
  locales: [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'ru', label: 'Русский' },
    { code: 'pt', label: 'Português' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ur', label: 'اردو' },
    { code: 'zh', label: '中文' }
  ],
  rtlLocales: ['ar', 'ur'],
  localeByCountry: {
    JO: 'ar', SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', EG: 'ar', IQ: 'ar', OM: 'ar', BH: 'ar',
    US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en',
    ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
    FR: 'fr', BE: 'fr', MA: 'fr', DZ: 'fr',
    TR: 'tr',
    RU: 'ru', KZ: 'ru',
    BR: 'pt', PT: 'pt',
    IN: 'hi',
    PK: 'ur',
    CN: 'zh', TW: 'zh', SG: 'zh'
  }
};
