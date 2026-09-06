import { sessionId } from './session.js'
import { apiGetOrderInstructionsBlob, IS_BACKEND_CONFIGURED } from './api.js'
import { mockGetOrderInstructionsBlob } from './mock.js'

export async function getOrderInstructionsPdf({ language }) {
  if (IS_BACKEND_CONFIGURED) {
    return apiGetOrderInstructionsBlob({ session_id: sessionId, language })
  }
  return mockGetOrderInstructionsBlob({ language })
}
