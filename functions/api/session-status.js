import { json } from '../_lib/http.js';
import { getSessionState } from '../_lib/security.js';

export async function onRequestGet(context) {
  const state = await getSessionState(context.request, context.env);
  return json({
    humanVerified: state.humanVerified,
    premiumActive: state.premiumActive
  });
}
