import { APP_CONFIG } from './config.js';
import { resolveLocale, populateLanguageSelect, applyTranslations, t } from './i18n.js';
import { fileToImage, blobToImage, downloadBlob, readCookie } from './utils.js';
import { detectFace, buildComplianceChecks } from './face-tools.js';
import { drawPreview, exportJpeg } from './photo-rules.js';
import { createCheckout, getSessionStatus, activatePremium } from './premium.js';
import { removeBackgroundLocally, detectWhiteBackground } from './background-segmenter.js';

const el = {
  language: document.getElementById('languageSelect'),
  languageMenu: document.getElementById('languageMenu'),
  languageTrigger: document.getElementById('languageTrigger'),
  languageCurrent: document.getElementById('languageCurrent'),
  languageOptions: document.getElementById('languageOptions'),
  themeToggle: document.getElementById('themeToggle'),
  photoInput: document.getElementById('photoInput'),
  originalPreview: document.getElementById('originalPreview'),
  previewCanvas: document.getElementById('previewCanvas'),
  verifyHumanBtn: document.getElementById('verifyHumanBtn'),
  humanStatus: document.getElementById('humanStatus'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  removeBgBtn: document.getElementById('removeBgBtn'),
  exportBtn: document.getElementById('exportBtn'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  checkoutStatus: document.getElementById('checkoutStatus'),
  analysisSummary: document.getElementById('analysisSummary'),
  checksList: document.getElementById('checksList'),
  exportFactsList: document.getElementById('exportFactsList'),
  zoomRange: document.getElementById('zoomRange'),
  offsetXRange: document.getElementById('offsetXRange'),
  offsetYRange: document.getElementById('offsetYRange'),
  premiumBadge: document.getElementById('premiumBadge'),
  adSlots: document.querySelectorAll('.ad-slot')
};

const state = {
  locale: 'en',
  bootstrap: null,
  file: null,
  originalImage: null,
  workingImage: null,
  analysis: null,
  humanVerified: false,
  premiumActive: false,
  backgroundAlreadyWhite: false
};

const successOrderId = new URLSearchParams(window.location.search).get('order_id');

async function bootstrap() {
  try {
    const [bootstrapResponse, sessionResponse] = await Promise.all([
      fetch('/api/bootstrap', { credentials: 'include' }).then((r) => r.json()),
      getSessionStatus().catch(() => ({ premiumActive: false, humanVerified: false }))
    ]);
    state.bootstrap = bootstrapResponse;
    state.humanVerified = Boolean(sessionResponse.humanVerified);
    state.premiumActive = Boolean(sessionResponse.premiumActive || bootstrapResponse?.premiumActive || readCookie('premium_hint') === '1');
  } catch {
    state.bootstrap = { suggestedLocale: 'en', turnstileSiteKey: '' };
  }

  const initialLocale = resolveLocale(
    localStorage.getItem('visa-photo-locale') ||
    state.bootstrap?.suggestedLocale ||
    navigator.language ||
    'en'
  );

  setLocale(initialLocale);
  bindEvents();
  initTurnstile();
  renderEmptyPreview();
  syncSessionUI();

  initLemonSqueezy();

  if (
    successOrderId &&
    (
      window.location.pathname.endsWith('/success.html') ||
      window.location.pathname.endsWith('/success')
    )
  ) {
    await handleSuccessPage(successOrderId);
  }
}

function setLocale(locale) {
  state.locale = locale;
  populateLanguageSelect(el.language, locale);
  applyTranslations(locale);
  syncCustomLanguageMenu(locale);
  localStorage.setItem('visa-photo-locale', locale);
  syncSessionUI();
}

function syncCustomLanguageMenu(locale) {
  if (!el.language || !el.languageOptions || !el.languageCurrent) return;
  const selected = Array.from(el.language.options).find((option) => option.value === locale) || el.language.options[0];
  el.languageCurrent.textContent = selected ? selected.textContent : locale;
  el.languageOptions.innerHTML = Array.from(el.language.options).map((option) => `
    <button type="button" class="lang-option ${option.value === locale ? 'active' : ''}" data-locale="${option.value}">
      <span>${option.textContent}</span>
    </button>
  `).join('');
  el.languageOptions.querySelectorAll('.lang-option').forEach((button) => {
    button.addEventListener('click', () => {
      el.language.value = button.dataset.locale;
      el.language.dispatchEvent(new Event('change'));
      closeLanguageMenu();
    });
  });
}

function closeLanguageMenu() {
  if (!el.languageOptions || !el.languageTrigger) return;
  el.languageOptions.classList.remove('open');
  el.languageTrigger.setAttribute('aria-expanded', 'false');
}

function toggleLanguageMenu() {
  if (!el.languageOptions || !el.languageTrigger) return;
  const willOpen = !el.languageOptions.classList.contains('open');
  closeLanguageMenu();
  if (willOpen) {
    el.languageOptions.classList.add('open');
    el.languageTrigger.setAttribute('aria-expanded', 'true');
  }
}


function syncSessionUI() {
  if (el.premiumBadge) el.premiumBadge.classList.toggle('hidden', !state.premiumActive);
  if (el.removeBgBtn) {
    if (state.backgroundAlreadyWhite) {
      el.removeBgBtn.disabled = true;
      el.removeBgBtn.textContent = state.locale === 'ar' ? 'الخلفية مناسبة' : 'Background is already suitable';
      el.removeBgBtn.classList.add('is-locked');
    } else {
      el.removeBgBtn.disabled = false;
      el.removeBgBtn.textContent = state.premiumActive ? t(state.locale, 'removeBg') : t(state.locale, 'removeBgLocked');
      el.removeBgBtn.classList.toggle('is-locked', !state.premiumActive);
    }
  }
  if (el.checkoutBtn) {
    el.checkoutBtn.disabled = state.premiumActive;
    el.checkoutBtn.textContent = state.premiumActive ? t(state.locale, 'premiumEnabledCta') : t(state.locale, 'buyPremium');
    el.checkoutBtn.classList.toggle('is-active', state.premiumActive);
  }
  if (el.checkoutStatus) {
    el.checkoutStatus.textContent = state.premiumActive ? t(state.locale, 'premiumEnabledHint') : t(state.locale, 'checkoutIdle');
  }
  if (el.adSlots?.length) el.adSlots.forEach((slot) => slot.classList.toggle('hidden', state.premiumActive));
  if (state.humanVerified) setHumanStatus(t(state.locale, 'humanVerified'), 'ok');
  else setHumanStatus(t(state.locale, 'humanPending'), 'warn');
  if (state.premiumActive) document.cookie = 'premium_hint=1; path=/; max-age=86400; SameSite=Lax';
  else document.cookie = 'premium_hint=0; path=/; max-age=0; SameSite=Lax';
}


function bindEvents() {
  el.language?.addEventListener('change', (e) => setLocale(e.target.value));
  el.languageTrigger?.addEventListener('click', (e) => { e.stopPropagation(); toggleLanguageMenu(); });
  document.addEventListener('click', (e) => { if (!el.languageMenu?.contains(e.target)) closeLanguageMenu(); });
  el.themeToggle?.addEventListener('click', () => document.body.classList.toggle('light'));
  el.photoInput?.addEventListener('change', onUpload);
  el.verifyHumanBtn?.addEventListener('click', verifyHuman);
  el.analyzeBtn?.addEventListener('click', analyzePhoto);
  el.removeBgBtn?.addEventListener('click', onRemoveBackground);
  el.exportBtn?.addEventListener('click', onExport);
  el.checkoutBtn?.addEventListener('click', onCheckout);
  ['zoomRange', 'offsetXRange', 'offsetYRange'].forEach((name) => {
    el[name]?.addEventListener('input', renderAnalysisPreview);
  });
}

function initTurnstile() {
  const siteKey = state.bootstrap?.turnstileSiteKey;
  if (!siteKey) {
    setHumanStatus(t(state.locale, 'turnstileMissing'), 'warn');
    return;
  }
  const boot = () => {
    if (!window.turnstile || document.querySelector('.cf-turnstile')) return;
    const wrapper = document.getElementById('turnstileWidget');
    if (!wrapper) return;
    wrapper.innerHTML = '';
    window.turnstile.render('#turnstileWidget', {
      sitekey: siteKey,
      callback(token) {
        state.turnstileToken = token;
      },
      'expired-callback'() {
        state.turnstileToken = '';
      }
    });
  };
  if (window.turnstile) boot();
  else window.addEventListener('load', boot, { once: true });
}

function renderEmptyPreview() {
  const canvas = el.previewCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = APP_CONFIG.exportSize;
  canvas.height = APP_CONFIG.exportSize;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.font = '700 20px Inter, sans-serif';
  ctx.fillText('600 × 600', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '400 13px Inter, sans-serif';
  ctx.fillText(t(state.locale, 'previewPlaceholder'), canvas.width / 2, canvas.height / 2 + 22);
}

async function onUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  state.file = file;
  const { image, url } = await fileToImage(file);
  state.originalImage = image;
  state.workingImage = image;
  state.analysis = null;

  try {
    const bgCheck = await detectWhiteBackground(image);
    state.backgroundAlreadyWhite = Boolean(bgCheck.isWhiteUniform);
  } catch {
    state.backgroundAlreadyWhite = false;
  }

  if (el.originalPreview) el.originalPreview.src = url;
  renderFitImage(image);
  el.checksList.innerHTML = '';
  el.exportFactsList.innerHTML = '';

  if (state.backgroundAlreadyWhite) {
    el.analysisSummary.textContent = state.locale === 'ar'
      ? 'تم اكتشاف خلفية بيضاء أو موحدة، لا حاجة لإزالة الخلفية.'
      : 'A white or uniform background was detected. Background removal is not needed.';
  } else {
    el.analysisSummary.textContent = t(state.locale, 'imageLoaded');
  }

  syncSessionUI();
}

function renderFitImage(image) {
  const canvas = el.previewCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = APP_CONFIG.exportSize;
  canvas.height = APP_CONFIG.exportSize;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  const ratio = Math.min(canvas.width / iw, canvas.height / ih);
  const drawW = iw * ratio;
  const drawH = ih * ratio;
  const dx = (canvas.width - drawW) / 2;
  const dy = (canvas.height - drawH) / 2;
  ctx.drawImage(image, dx, dy, drawW, drawH);
}

async function verifyHuman() {
  if (!state.turnstileToken) {
    setHumanStatus(t(state.locale, 'completeHumanChallenge'), 'warn');
    return;
  }
  setHumanStatus(t(state.locale, 'verifying'), 'warn');
  try {
    const response = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: state.turnstileToken })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t(state.locale, 'verificationFailed'));
    state.humanVerified = true;
    setHumanStatus(t(state.locale, 'humanVerified'), 'ok');
  } catch (error) {
    state.humanVerified = false;
    setHumanStatus(error.message || t(state.locale, 'verificationFailed'), 'err');
  }
}

async function analyzePhoto() {
  if (!state.file || !state.workingImage) {
    el.analysisSummary.textContent = t(state.locale, 'uploadFirst');
    return;
  }
  if (!state.humanVerified) {
    el.analysisSummary.textContent = t(state.locale, 'verifyBeforeEditing');
    return;
  }
  el.analysisSummary.textContent = t(state.locale, 'runningAnalysis');
  try {
    state.analysis = await detectFace(state.workingImage, state.locale);
    renderAnalysisPreview();
    const checks = buildComplianceChecks(state.analysis, state.workingImage, state.file, state.locale);
    renderList(el.checksList, checks);
    const ratio = ((state.analysis.diagnostics.headRatio || 0) * 100).toFixed(1);
    if (state.locale === 'ar') {
      el.analysisSummary.textContent = t(state.locale, 'faceDetectedSummary')
        .replace('{ratio}', ratio)
        .replace('{width}', state.analysis.diagnostics.width)
        .replace('{height}', state.analysis.diagnostics.height);
    } else {
      el.analysisSummary.textContent = t(state.locale, 'faceDetectedSummary')
        .replace('{ratio}', ratio)
        .replace('{width}', state.analysis.diagnostics.width)
        .replace('{height}', state.analysis.diagnostics.height);
    }
  } catch (error) {
    el.analysisSummary.textContent = error.message || t(state.locale, 'analysisFailed');
  }
}

function renderAnalysisPreview() {
  if (!state.analysis || !state.workingImage) return;
  drawPreview({
    canvas: el.previewCanvas,
    sourceImage: state.workingImage,
    crop: state.analysis.crop,
    zoom: Number(el.zoomRange.value),
    offsetX: Number(el.offsetXRange.value),
    offsetY: Number(el.offsetYRange.value)
  });
}

async function onExport() {
  if (!state.analysis) {
    el.analysisSummary.textContent = t(state.locale, 'runAnalysisBeforeExport');
    return;
  }
  renderAnalysisPreview();
  const { blob, facts } = await exportJpeg(
    {
      sourceImage: state.workingImage,
      crop: state.analysis.crop,
      zoom: Number(el.zoomRange.value),
      offsetX: Number(el.offsetXRange.value),
      offsetY: Number(el.offsetYRange.value)
    },
    state.locale
  );
  renderList(el.exportFactsList, facts.map((label) => ({ state: 'pass', label })));
  downloadBlob(blob, 'us-visa-photo-600x600.jpg');
}

async function onRemoveBackground() {
  if (state.backgroundAlreadyWhite) {
    el.analysisSummary.textContent = state.locale === 'ar'
      ? 'الخلفية الحالية مناسبة أصلًا، لا حاجة لإزالة الخلفية.'
      : 'The current background is already suitable. Background removal is not needed.';
    return;
  }

  if (!state.premiumActive) {
    el.analysisSummary.textContent = t(state.locale, 'bgUpsellNotice');
    const shouldOpenCheckout = window.confirm(t(state.locale, 'bgUpsellPrompt'));
    if (shouldOpenCheckout) {
      await onCheckout();
    }
    return;
  }
  if (!state.workingImage) {
    el.analysisSummary.textContent = t(state.locale, 'uploadFirst');
    return;
  }
  el.analysisSummary.textContent = t(state.locale, 'removingBg');
  if (el.removeBgBtn) {
    el.removeBgBtn.disabled = true;
    el.removeBgBtn.textContent = t(state.locale, 'removingBgBtn');
  }
  try {
    const blob = await removeBackgroundLocally(state.workingImage);
    const { image, url } = await blobToImage(blob);
    state.workingImage = image;
    state.file = new File([blob], 'background-cleaned.png', { type: blob.type || 'image/png' });
    if (el.originalPreview) el.originalPreview.src = url;
    renderFitImage(image);
    state.analysis = null;
    el.checksList.innerHTML = '';
    el.exportFactsList.innerHTML = '';
    el.analysisSummary.textContent = t(state.locale, 'bgRemoved');
  } catch (error) {
    el.analysisSummary.textContent = error.message || t(state.locale, 'bgRemoveFailed');
  } finally {
    if (el.removeBgBtn) {
      if (state.backgroundAlreadyWhite) {
        el.removeBgBtn.disabled = true;
        el.removeBgBtn.textContent = state.locale === 'ar' ? 'الخلفية مناسبة' : 'Background is already suitable';
        el.removeBgBtn.classList.add('is-locked');
      } else {
        el.removeBgBtn.disabled = false;
        el.removeBgBtn.textContent = state.premiumActive ? t(state.locale, 'removeBg') : t(state.locale, 'removeBgLocked');
        el.removeBgBtn.classList.toggle('is-locked', !state.premiumActive);
      }
    }
  }
}

function initLemonSqueezy() {
  const setup = () => {
    if (!window.LemonSqueezy || state.lemonReady) return;
    window.LemonSqueezy.Setup({
      eventHandler: async (event) => {
        if (event?.event !== 'Checkout.Success') return;
        const orderId = event?.data?.id;
        if (!orderId) return;
        try {
          const data = await activatePremium(orderId);
          state.premiumActive = Boolean(data.premiumActive);
          syncSessionUI();
          if (el.checkoutStatus) el.checkoutStatus.textContent = t(state.locale, 'paymentCompleted');
          if (el.analysisSummary) el.analysisSummary.textContent = t(state.locale, 'premiumUnlocked');
        } catch (error) {
          if (el.checkoutStatus) el.checkoutStatus.textContent = error.message || t(state.locale, 'premiumActivationFailed');
        }
      }
    });
    state.lemonReady = true;
  };

  if (window.LemonSqueezy) setup();
  else window.addEventListener('load', setup, { once: true });
}

async function onCheckout() {
  if (state.premiumActive) {
    el.checkoutStatus.textContent = t(state.locale, 'premiumEnabledHint');
    return;
  }
  el.checkoutStatus.textContent = t(state.locale, 'openingCheckout');
  try {
    const data = await createCheckout();
    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(data.url);
    } else if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    el.checkoutStatus.textContent = error.message || t(state.locale, 'checkoutStartFailed');
  }
}

async function handleSuccessPage(orderId) {
  const target = document.getElementById('successStatus');
  if (!target) return;
  target.textContent = t(state.locale, 'successWait');
  try {
    const data = await activatePremium(orderId);
    state.premiumActive = Boolean(data.premiumActive);
    syncSessionUI();
    target.textContent = t(state.locale, 'successText');
  } catch (error) {
    target.textContent = error.message || t(state.locale, 'paymentVerificationFailed');
  }
}

function renderList(listEl, items) {
  if (!listEl) return;
  listEl.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = `check-item ${item.state || 'pass'}`;
    li.innerHTML = `<span class="check-dot"></span><span>${item.label}</span>`;
    listEl.appendChild(li);
  });
}

function setHumanStatus(text, type = '') {
  if (!el.humanStatus) return;
  el.humanStatus.className = `status-line ${type}`.trim();
  el.humanStatus.textContent = text;
}

bootstrap();
