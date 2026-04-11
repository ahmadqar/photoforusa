import { json } from '../_lib/http.js';

export async function onRequestGet() {
  return json({ ok: true, service: 'visa-photo-studio-pro', timestamp: Date.now() });
}
