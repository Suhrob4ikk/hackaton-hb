export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const IS_BACKEND_CONFIGURED = Boolean(API_BASE_URL)

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

export function apiSendChatMessage(payload) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function apiGetCheaperAlternative(payload) {
  return request('/api/cart/alternative', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function apiAddToCart(payload) {
  return request('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function apiGetCart(sessionId) {
  return request(`/api/cart?session_id=${encodeURIComponent(sessionId)}`)
}

export function apiCheckout(payload) {
  return request('/api/cart/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function apiGetCatalogTop({ limit = 8 } = {}) {
  return request(`/api/catalog/top?limit=${encodeURIComponent(limit)}`)
}
