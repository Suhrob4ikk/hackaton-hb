function createSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const sessionId = createSessionId()
