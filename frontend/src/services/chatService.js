import { sessionId } from './session.js'
import { apiSendChatMessage, apiGetCheaperAlternative, IS_BACKEND_CONFIGURED } from './api.js'
import { mockSendChatMessage, mockGetCheaperAlternative } from './mock.js'

export async function sendChatMessage({ message, language, hasHistory }) {
  if (IS_BACKEND_CONFIGURED) {
    return apiSendChatMessage({ session_id: sessionId, message, language })
  }
  return mockSendChatMessage({ message, language, hasHistory })
}

export async function getCheaperAlternative({ productId }) {
  if (IS_BACKEND_CONFIGURED) {
    return apiGetCheaperAlternative({ session_id: sessionId, product_id: productId })
  }
  return mockGetCheaperAlternative({ productId })
}
