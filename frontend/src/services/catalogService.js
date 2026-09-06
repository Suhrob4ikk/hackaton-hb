import { apiGetCatalogTop, IS_BACKEND_CONFIGURED } from './api.js'
import { mockGetCatalogTop } from './mock.js'

export async function getCatalogTop({ limit = 8 } = {}) {
  if (IS_BACKEND_CONFIGURED) {
    return apiGetCatalogTop({ limit })
  }
  return mockGetCatalogTop()
}
