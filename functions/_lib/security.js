const encoder = new TextEncoder();

function b64urlEncode(input) {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input;
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64urlDecodeToString(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
    + '==='.slice((input.length + 3) % 4);
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmacSHA256(secret, text) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(text));
  return b64urlEncode(new Uint8Array(signature));
}


async function hmacSHA256Hex(secret, text) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(text));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function signPayload(payload, secret) {
  const body = JSON.stringify(payload);
  const encodedBody = b64urlEncode(body);
  const signature = await hmacSHA256(secret, encodedBody);
  return `${encodedBody}.${signature}`;
}

export async function verifyPayload(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = await hmacSHA256(secret, body);
  if (expected !== signature) return null;
  const payload = JSON.parse(b64urlDecodeToString(body));
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

export function parseCookies(request) {
  const header = request.headers.get('cookie') || '';
  return Object.fromEntries(
    header.split(';').map((part) => part.trim()).filter(Boolean).map((item) => {
      const index = item.indexOf('=');
      return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
    })
  );
}

export async function setSignedCookie(headers, name, payload, secret, maxAgeSeconds, extras = 'Path=/; HttpOnly; Secure; SameSite=Lax') {
  const token = await signPayload({
    ...payload,
    exp: Date.now() + maxAgeSeconds * 1000
  }, secret);
  headers.append('Set-Cookie', `${name}=${encodeURIComponent(token)}; Max-Age=${maxAgeSeconds}; ${extras}`);
}

export async function getSessionState(request, env) {
  const cookies = parseCookies(request);
  const secret = env.SESSION_SECRET || 'dev-session-secret-change-me';
  const human = await verifyPayload(cookies.human_session, secret);
  const premium = await verifyPayload(cookies.premium_session, secret);
  return {
    humanVerified: Boolean(human?.ok),
    premiumActive: Boolean(premium?.ok),
    human,
    premium
  };
}

export async function verifyStripeSignature(body, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(signatureHeader.split(',').map((part) => part.split('=')));
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) return false;
  const signedPayload = `${timestamp}.${body}`;
  const expected = await hmacSHA256(secret, signedPayload);
  return expected === v1;
}

export async function verifyLemonSignature(body, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const expected = await hmacSHA256Hex(secret, body);
  return expected === signatureHeader;
}
