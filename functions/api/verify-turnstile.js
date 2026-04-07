import { json, error } from '../_lib/http.js';
import { setSignedCookie } from '../_lib/security.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const { token } = await request.json().catch(() => ({}));
  if (!token) return error('Missing Turnstile token.');

  if (!env.TURNSTILE_SECRET) {
    return error('TURNSTILE_SECRET is not configured in Cloudflare.', 500);
  }

  const remoteip = request.headers.get('CF-Connecting-IP') || '';
  const form = new URLSearchParams();
  form.set('secret', env.TURNSTILE_SECRET);
  form.set('response', token);
  if (remoteip) form.set('remoteip', remoteip);

  const siteverify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  const data = await siteverify.json();

  if (!data.success) {
    return error('Human verification failed.', 403, { codes: data['error-codes'] || [] });
  }

  const headers = new Headers();
  await setSignedCookie(headers, 'human_session', { ok: true }, env.SESSION_SECRET || 'dev-session-secret-change-me', 60 * 60 * 24);
  return json({ success: true }, { headers });
}
