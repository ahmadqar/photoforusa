import { error } from '../_lib/http.js';

export async function onRequestPost() {
  return error('This build now removes backgrounds on-device in the browser for Premium users. No external API is required.', 410);
}
