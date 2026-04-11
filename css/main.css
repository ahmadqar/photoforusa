:root {
  --bg: #020617;
  --bg-soft: #0f172a;
  --panel: rgba(15, 23, 42, 0.76);
  --panel-solid: #0b1220;
  --panel-2: #111827;
  --line: rgba(148, 163, 184, 0.18);
  --line-strong: rgba(148, 163, 184, 0.32);
  --text: #e5eefb;
  --muted: #94a3b8;
  --brand: #2563eb;
  --brand-2: #0ea5e9;
  --ok: #10b981;
  --warn: #f59e0b;
  --danger: #ef4444;
  --shadow: 0 24px 70px rgba(2, 6, 23, 0.42);
  --radius: 24px;
  --radius-lg: 32px;
  --max: 1240px;
  --font: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body.light {
  --bg: #eff6ff;
  --bg-soft: #f8fafc;
  --panel: rgba(255,255,255,0.84);
  --panel-solid: #ffffff;
  --panel-2: #ffffff;
  --line: rgba(15, 23, 42, 0.08);
  --line-strong: rgba(15, 23, 42, 0.16);
  --text: #0f172a;
  --muted: #475569;
  --shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font);
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 28%),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.18), transparent 22%),
    linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
  min-height: 100vh;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button, input, select {
  font: inherit;
}
button { cursor: pointer; }
.container {
  width: min(var(--max), calc(100% - 2rem));
  margin: 0 auto;
}
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
.page-shell { padding-bottom: 4rem; }
.glass, .glass-card, .panel, .card, .pricing-card, .editor-main, .editor-sidebar, .guide-card, .faq-card, .stat-card, .feature-card, .trust-card, .article-card {
  background: var(--panel);
  backdrop-filter: blur(16px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0 0.5rem;
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(10px);
}
.topbar-inner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.8rem 1rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.45);
}
body.light .topbar-inner { background: rgba(255,255,255,0.8); }
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}
.brand img { width: 180px; height: auto; }
.brand-copy { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.brand-copy strong { font-size: 1rem; }
.brand-copy span { color: var(--muted); font-size: 0.9rem; }

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.nav-links a { color: var(--muted); font-size: 0.95rem; }
.nav-links a:hover { color: var(--text); }
.topbar-actions { display: flex; gap: 0.8rem; align-items: center; }
select, .ghost-btn, .secondary-btn, .primary-btn, .premium-btn, .soft-btn {
  border-radius: 16px;
  border: 1px solid var(--line-strong);
  padding: 0.85rem 1rem;
  color: var(--text);
  background: rgba(15, 23, 42, 0.45);
}
body.light select,
body.light .ghost-btn,
body.light .secondary-btn,
body.light .soft-btn { background: rgba(255,255,255,0.85); }
.primary-btn {
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  border: 0;
  color: white;
  font-weight: 700;
}
.premium-btn {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: 0;
  color: #111827;
  font-weight: 800;
}

.premium-btn.is-active {
  background: linear-gradient(135deg, rgba(16,185,129,0.92), rgba(5,150,105,0.92));
  color: white;
}
.premium-btn:disabled {
  opacity: 0.96;
  cursor: default;
}
.secondary-btn {
  background: rgba(37,99,235,0.09);
}
.soft-btn { background: transparent; }
.block-btn { width: 100%; }
.section {
  padding: 2rem 0;
}
.hero {
  padding: 2rem 0 1rem;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.2rem;
  align-items: stretch;
}
.hero-copy, .hero-visual {
  padding: 1.5rem;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(14,165,233,0.12);
  color: #7dd3fc;
  border: 1px solid rgba(125,211,252,0.22);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.hero h1 {
  margin: 1rem 0 0.6rem;
  font-size: clamp(2rem, 4vw, 4.4rem);
  line-height: 1;
  letter-spacing: -0.04em;
}
.hero p.lead {
  color: var(--muted);
  font-size: 1.06rem;
  line-height: 1.8;
  max-width: 62ch;
}
.hero-actions, .badges {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.pill {
  padding: 0.62rem 0.9rem;
  border-radius: 999px;
  background: rgba(148,163,184,0.08);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: 0.92rem;
}
.note {
  margin-top: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(148,163,184,0.07);
  color: var(--muted);
}
.visual-frame {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(15,23,42,0.72), rgba(15,23,42,0.35));
  padding: 1rem;
  height: 100%;
  min-height: 460px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 0.8rem;
  margin-top: 1rem;
}
.metric-card, .stat-card {
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(15, 23, 42, 0.45);
}
.metric-card strong, .stat-card strong {
  display: block;
  font-size: 1.25rem;
}
.metric-card span, .stat-card span {
  color: var(--muted);
  font-size: 0.92rem;
}
.trust-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 1rem;
}
.trust-card, .feature-card, .faq-card, .article-card, .guide-card, .pricing-card, .card {
  padding: 1.2rem;
}
.trust-card h3, .feature-card h3, .pricing-card h3, .guide-card h3, .article-card h3 {
  margin: 0 0 0.45rem;
}
.trust-card p, .feature-card p, .pricing-card p, .guide-card p, .article-card p, .faq-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}
.ad-band {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 280px;
}
.ad-slot {
  min-height: 110px;
  border-radius: 22px;
  border: 1.5px dashed rgba(148, 163, 184, 0.34);
  background: rgba(15,23,42,0.34);
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--muted);
  padding: 1rem;
}
.ad-slot small { display:block; margin-top: .35rem; }
.ad-slot.vertical { min-height: 560px; }
.hidden { display: none !important; }

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1rem;
}
.section-head h2 {
  margin: 0.2rem 0 0.3rem;
  font-size: clamp(1.6rem, 2.8vw, 2.8rem);
  letter-spacing: -0.03em;
}
.section-head p { color: var(--muted); margin: 0; max-width: 70ch; line-height: 1.7; }

.editor-shell {
  display: grid;
  grid-template-columns: 390px 1fr 280px;
  gap: 1rem;
  align-items: start;
}
.editor-sidebar, .editor-main, .editor-ads {
  padding: 1.2rem;
}
.field-stack {
  display: grid;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.field-label {
  font-weight: 700;
  font-size: 0.94rem;
}
.hint, .muted { color: var(--muted); }
input[type="file"] {
  width: 100%;
  padding: 0.9rem;
  border: 1px dashed var(--line-strong);
  border-radius: 16px;
  background: rgba(148,163,184,0.05);
  color: var(--muted);
}
input[type="range"] { width: 100%; accent-color: var(--brand); }
.turnstile-wrap {
  min-height: 70px;
  display: grid;
  align-items: center;
}
.status-line {
  padding: 0.8rem 0.9rem;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: rgba(148,163,184,0.05);
  font-size: 0.93rem;
}
.status-line.ok { color: #bbf7d0; border-color: rgba(16,185,129,0.32); background: rgba(16,185,129,0.1); }
.status-line.warn { color: #fde68a; border-color: rgba(245,158,11,0.32); background: rgba(245,158,11,0.1); }
.status-line.err { color: #fecaca; border-color: rgba(239,68,68,0.32); background: rgba(239,68,68,0.08); }

.editor-toolbar {
  display: flex;
  gap: 0.8rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.editor-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 1rem;
}
.preview-panel {
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(2,6,23,0.24);
}
.preview-panel h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.preview-box {
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  background:
    linear-gradient(45deg, rgba(148,163,184,0.1) 25%, transparent 25%, transparent 75%, rgba(148,163,184,0.1) 75%),
    linear-gradient(45deg, rgba(148,163,184,0.1) 25%, transparent 25%, transparent 75%, rgba(148,163,184,0.1) 75%);
  background-position: 0 0, 12px 12px;
  background-size: 24px 24px;
  display: grid;
  place-items: center;
}
.preview-box img, .preview-box canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
}
.analysis-summary {
  margin-top: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(148,163,184,0.05);
  line-height: 1.7;
  color: var(--muted);
}
.check-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}
.check-card {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(148,163,184,0.05);
}
.check-card h3 { margin-top: 0; }
.check-item {
  display: flex;
  gap: 0.7rem;
  align-items: start;
  padding: 0.58rem 0;
  color: var(--muted);
  list-style: none;
  border-bottom: 1px solid rgba(148,163,184,0.08);
}
.check-item:last-child { border-bottom: 0; }
.check-dot {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  margin-top: 0.35rem;
  flex: 0 0 auto;
  background: var(--muted);
}
.check-item.pass .check-dot { background: var(--ok); }
.check-item.warn .check-dot { background: var(--warn); }
.check-item.fail .check-dot { background: var(--danger); }

.grid-3, .guides-grid, .pricing-grid, .feature-grid, .faq-grid, .article-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.guides-grid .guide-card, .article-grid .article-card { min-height: 100%; }

.pricing-card.featured {
  position: relative;
  border-color: rgba(37,99,235,0.45);
  box-shadow: 0 24px 70px rgba(37, 99, 235, 0.16);
}
.ribbon {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(37,99,235,0.16);
  color: #93c5fd;
  border: 1px solid rgba(59,130,246,0.28);
  font-size: 0.82rem;
  font-weight: 700;
}
.price {
  font-size: 2.4rem;
  line-height: 1;
  margin: 0.8rem 0 0.3rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.price-sub { color: var(--muted); margin-bottom: 1rem; }
.pricing-list, .link-list {
  display: grid;
  gap: 0.7rem;
  padding: 0;
  margin: 1rem 0 0;
}
.pricing-list li, .link-list li {
  list-style: none;
  color: var(--muted);
  padding-left: 1.4rem;
  position: relative;
}
.pricing-list li::before, .link-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--brand-2);
}

.callout {
  padding: 1.1rem 1.2rem;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(37,99,235,0.16), rgba(14,165,233,0.12));
  border: 1px solid rgba(37,99,235,0.22);
}
.callout h3 { margin-top: 0; }
.footer {
  padding: 2rem 0 3rem;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr;
  gap: 1rem;
}
.footer small, .footer p, .footer li { color: var(--muted); line-height: 1.8; }
.footer ul { padding: 0; margin: 0; }
.footer li { list-style: none; }

.page-hero {
  padding: 2rem 0 0.8rem;
}
.page-hero h1 {
  margin: .6rem 0;
  font-size: clamp(2rem, 3.2vw, 3.2rem);
  letter-spacing: -0.04em;
}
.page-hero p { color: var(--muted); max-width: 72ch; line-height: 1.8; }
.article-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
}
.article-card h2, .article-card h3 {
  letter-spacing: -0.03em;
}
.article-card p, .article-card li {
  color: var(--muted);
  line-height: 1.8;
}
.article-card ul, .article-card ol {
  padding-left: 1.3rem;
}
.breadcrumbs {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 0.92rem;
}
.inline-links {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.inline-links a {
  color: #93c5fd;
}
.faq-item + .faq-item {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

@media (max-width: 1100px) {
  .editor-shell { grid-template-columns: 1fr; }
  .ad-band, .article-layout, .footer-grid { grid-template-columns: 1fr; }
  .grid-3, .guides-grid, .pricing-grid, .feature-grid, .faq-grid, .article-grid, .trust-row { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .hero-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .topbar-inner {
    border-radius: 24px;
    flex-direction: column;
    align-items: stretch;
  }
  .nav-links { display: none; }
  .brand img { width: 150px; }
  .editor-grid, .check-grid, .grid-3, .guides-grid, .pricing-grid, .feature-grid, .faq-grid, .article-grid, .trust-row, .metrics {
    grid-template-columns: 1fr;
  }
  .hero-copy, .hero-visual, .editor-sidebar, .editor-main, .editor-ads, .pricing-card, .feature-card, .guide-card, .article-card {
    padding: 1rem;
  }
  .section { padding: 1.5rem 0; }
}
