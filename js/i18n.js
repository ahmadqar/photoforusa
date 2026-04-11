import { APP_CONFIG } from './config.js';
import { TRANSLATIONS } from './translations.js';

export function resolveLocale(rawValue = '') {
  const value = (rawValue || '').toLowerCase();
  const short = value.split('-')[0];
  return APP_CONFIG.locales.some((item) => item.code === short) ? short : 'en';
}

export function getDirection(locale) {
  return APP_CONFIG.rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

export function populateLanguageSelect(selectEl, currentLocale) {
  if (!selectEl) return;
  selectEl.innerHTML = APP_CONFIG.locales
    .map((locale) => `<option value="${locale.code}" ${locale.code === currentLocale ? 'selected' : ''}>${locale.label}</option>`)
    .join('');
}

export function t(locale, key) {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en?.[key] ?? key;
}

export function applyTranslations(locale) {
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (dict[key]) node.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach((node) => {
    const key = node.getAttribute('data-i18n-html');
    if (dict[key]) node.innerHTML = dict[key];
  });
}
