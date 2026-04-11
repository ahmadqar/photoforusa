export async function createCheckout() {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not start checkout.');
  return data;
}

export async function activatePremium(orderId) {
  const response = await fetch('/api/activate-premium', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ orderId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not activate premium.');
  return data;
}

export async function removeBackground(file) {
  const form = new FormData();
  form.append('photo', file);
  const response = await fetch('/api/remove-background', {
    method: 'POST',
    credentials: 'include',
    body: form
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Background removal failed.');
  }
  return await response.blob();
}

export async function getSessionStatus() {
  const response = await fetch('/api/session-status', {
    credentials: 'include'
  });
  return response.json();
}
