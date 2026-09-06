import { sessionId } from './session.js'
import { apiAddToCart, apiCheckout, IS_BACKEND_CONFIGURED } from './api.js'
import { mockAddToCart, mockCheckout } from './mock.js'

export async function addToCart({ productId, quantity = 1 }) {
  if (IS_BACKEND_CONFIGURED) {
    return apiAddToCart({ session_id: sessionId, product_id: productId, quantity })
  }
  return mockAddToCart({ productId, quantity })
}

export async function checkout({ items }) {
  if (IS_BACKEND_CONFIGURED) {
    return apiCheckout({ session_id: sessionId, items })
  }
  return mockCheckout({ items })
}
