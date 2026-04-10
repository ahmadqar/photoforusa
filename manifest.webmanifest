import { APP_CONFIG } from './config.js';
import { resolveLocale, populateLanguageSelect, applyTranslations, t } from './i18n.js';
import { fileToImage, blobToImage, downloadBlob, readCookie } from './utils.js';
import { detectFace, buildComplianceChecks } from './face-tools.js';
import { drawPreview, exportJpeg } from './photo-rules.js';
import { createCheckout, getSessionStatus, activatePremium } from './premium.js';
import { removeBackgroundLocally } from './background-segmenter.js';

const el = {
  language: document.getElementById('languageSelect'),
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
  premiumActive: false
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

  if (successOrderId && window.location.pathname.endsWith('/success.html')) {
    await handleSuccessPage(successOrderId);
  }
}

function setLocale(locale) {
  state.locale = locale;
  populateLanguageSelect(el.language, locale);
  applyTranslations(locale);
  localStorage.setItem('visa-photo-locale', locale);
  syncSessionUI();
}


function syncSessionUI() {
  if (el.premiumBadge) el.premiumBadge.classList.toggle('hidden', !state.premiumActive);
  if (el.removeBgBtn) {
    el.removeBgBtn.disabled = !state.premiumActive;
    el.removeBgBtn.textContent = t(state.locale, 'removeBg');
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
  if (state.humanVerified) setHumanStatus('Verified. Editing is unlocked.', 'ok');
  else setHumanStatus(t(state.locale, 'humanPending'), 'warn');
  if (state.premiumActive) document.cookie = 'premium_hint=1; path=/; max-age=86400; SameSite=Lax';
}


function bindEvents() {
  el.language?.addEventListener('change', (e) => setLocale(e.target.value));
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
    setHumanStatus('Turnstile site key is not configured yet.', 'warn');
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
  ctx.font = '700 24px Inter, sans-serif';
  ctx.fillText('600 × 600', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '400 15px Inter, sans-serif';
  ctx.fillText('Upload a portrait to preview the crop', canvas.width / 2, canvas.height / 2 + 22);
}

async function onUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  state.file = file;
  const { image, url } = await fileToImage(file);
  state.originalImage = image;
  state.workingImage = image;
  state.analysis = null;
  if (el.originalPreview) el.originalPreview.src = url;
  renderFitImage(image);
  el.checksList.innerHTML = '';
  el.exportFactsList.innerHTML = '';
  el.analysisSummary.textContent = 'Image loaded. Verify the user and run analysis.';
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
    setHumanStatus('Complete the human verification challenge first.', 'warn');
    return;
  }
  setHumanStatus('Verifying…', 'warn');
  try {
    const response = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: state.turnstileToken })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Verification failed.');
    state.humanVerified = true;
    setHumanStatus('Verified. Editing is unlocked.', 'ok');
  } catch (error) {
    state.humanVerified = false;
    setHumanStatus(error.message || 'Verification failed.', 'err');
  }
}

async function analyzePhoto() {
  if (!state.file || !state.workingImage) {
    el.analysisSummary.textContent = 'Upload an image first.';
    return;
  }
  if (!state.humanVerified) {
    el.analysisSummary.textContent = 'Please verify the visitor before editing.';
    return;
  }
  el.analysisSummary.textContent = 'Running AI face analysis…';
  try {
    state.analysis = await detectFace(state.workingImage);
    renderAnalysisPreview();
    const checks = buildComplianceChecks(state.analysis, state.workingImage, state.file);
    renderList(el.checksList, checks);
    el.analysisSummary.textContent =
      `${state.analysis.message} Estimated head height: ${(state.analysis.diagnostics.headRatio * 100 || 0).toFixed(1)}%. ` +
      `Source image: ${state.analysis.diagnostics.width}×${state.analysis.diagnostics.height}.`;
  } catch (error) {
    el.analysisSummary.textContent = error.message || 'Analysis failed.';
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
    el.analysisSummary.textContent = 'Run analysis before export.';
    return;
  }
  renderAnalysisPreview();
  const { blob, facts } = await exportJpeg(el.previewCanvas);
  renderList(el.exportFactsList, facts.map((label) => ({ state: 'pass', label })));
  downloadBlob(blob, 'us-visa-photo-600x600.jpg');
}

async function onRemoveBackground() {
  if (!state.premiumActive) {
    el.analysisSummary.textContent = 'Premium access is required for background removal.';
    return;
  }
  if (!state.workingImage) {
    el.analysisSummary.textContent = 'Upload an image first.';
    return;
  }
  el.analysisSummary.textContent = 'Removing background in your browser…';
  if (el.removeBgBtn) {
    el.removeBgBtn.disabled = true;
    el.removeBgBtn.textContent = 'Removing background…';
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
    el.analysisSummary.textContent = 'Background removed with on-device AI. Run analysis again to refresh the crop.';
  } catch (error) {
    el.analysisSummary.textContent = error.message || 'Background removal failed.';
  } finally {
    if (el.removeBgBtn) {
      el.removeBgBtn.disabled = !state.premiumActive;
      el.removeBgBtn.textContent = t(state.locale, 'removeBg');
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
          if (el.checkoutStatus) el.checkoutStatus.textContent = 'Payment completed. Premium is now active on this browser.';
          if (el.analysisSummary) el.analysisSummary.textContent = 'Premium unlocked. Background removal is ready.';
        } catch (error) {
          if (el.checkoutStatus) el.checkoutStatus.textContent = error.message || 'Payment succeeded, but premium activation failed.';
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
  el.checkoutStatus.textContent = 'Opening secure checkout…';
  try {
    const data = await createCheckout();
    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(data.url);
    } else if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    el.checkoutStatus.textContent = error.message || 'Could not start checkout.';
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
    target.textContent = error.message || 'Payment verification failed.';
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
