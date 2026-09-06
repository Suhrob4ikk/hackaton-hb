import { sessionId } from './session.js'
import { apiSendChatMessage, apiGetCheaperAlternative, IS_BACKEND_CONFIGURED } from './api.js'
import { mockSendChatMessage, mockGetCheaperAlternative } from './mock.js'
import translations from '../data/translations.js'

export async function sendChatMessage({ message, language, hasHistory }) {
  if (IS_BACKEND_CONFIGURED) {
    return apiSendChatMessage({ session_id: sessionId, message, language })
  }
  return mockSendChatMessage({ message, language, hasHistory })
}

export async function getCheaperAlternative({ productId, language }) {
  if (IS_BACKEND_CONFIGURED) {
    // Real backend contract for POST /api/cart/alternative is
    // {"alternative": ProductOut | null} - not the {reply, products} shape
    // the mock layer uses, so it's normalized here into the shape the rest
    // of the chat UI (ChatWindow/ChatMessage/ProductCard) expects.
    const { alternative } = await apiGetCheaperAlternative({ session_id: sessionId, product_id: productId })
    const copy = (translations[language] ?? translations.ru).ai
    return alternative
      ? { reply: copy.cheaperFound, products: [alternative] }
      : { reply: copy.cheaperUnavailable, products: [] }
  }
  return mockGetCheaperAlternative({ productId })
}
