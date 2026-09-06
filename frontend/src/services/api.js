export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const IS_BACKEND_CONFIGURED = Boolean(API_BASE_URL)

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    // Best-effort: surface the backend's {detail} message (used by the auth
    // endpoints for things like "email already registered") when present,
    // without changing behavior for callers that don't inspect it.
    let detail = null
    try {
      detail = (await response.json())?.detail ?? null
    } catch {
      // response body wasn't JSON - fall back to the generic message below
    }
    throw new Error(detail || `API request failed: ${response.status}`)
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

export function apiRegister(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function apiLogin(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function apiGetPurchases(token) {
  return request(`/api/account/purchases?token=${encodeURIComponent(token)}`)
}
