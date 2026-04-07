import { error } from '../_lib/http.js';
import { getSessionState } from '../_lib/security.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const session = await getSessionState(request, env);
  if (!session.premiumActive) return error('Premium access is required for background removal.', 403);
  if (!env.REMOVEBG_API_KEY) return error('REMOVEBG_API_KEY is not configured.', 500);

  const formData = await request.formData().catch(() => null);
  const photo = formData?.get('photo');
  if (!photo) return error('Missing uploaded image.', 400);

  const upstream = new FormData();
  upstream.append('image_file', photo, photo.name || 'upload.png');
  upstream.append('size', 'auto');
  upstream.append('format', 'png');
  upstream.append('bg_color', 'white');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': env.REMOVEBG_API_KEY
    },
    body: upstream
  });

  if (!response.ok) {
    const text = await response.text();
    return error(`remove.bg request failed: ${text.slice(0, 200)}`, 500);
  }

  const headers = new Headers();
  headers.set('Content-Type', 'image/png');
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, { headers });
}
