import mockProducts from '../data/mockProducts.js'
import { chatCopy, detectCategory } from '../data/mockChat.js'

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function premiumProductFor(category) {
  return mockProducts.find((product) => product.category === category && product.tier === 'premium')
}

export async function mockSendChatMessage({ message, language, hasHistory }) {
  await delay(700 + Math.random() * 500)
  const copy = chatCopy[language] ?? chatCopy.ru
  const category = detectCategory(message)

  if (!category && !hasHistory) {
    return { reply: copy.clarify, products: [] }
  }

  const resolvedCategory = category ?? 'dry'
  const product = premiumProductFor(resolvedCategory)
  const intro = category ? copy.intros[resolvedCategory] : copy.intros.fallback

  return { reply: intro, products: product ? [product] : [] }
}

export async function mockGetCheaperAlternative({ productId }) {
  await delay(500 + Math.random() * 400)
  const copy = chatCopy.ru
  const current = mockProducts.find((product) => product.id === productId)
  const alternative = current && mockProducts.find((product) => product.id === current.pairId)

  if (!alternative) {
    return { reply: copy.cheaperUnavailable, products: current ? [current] : [] }
  }

  return { reply: copy.cheaperIntro, products: [alternative] }
}

export async function mockAddToCart() {
  await delay(250)
  return { success: true }
}

export async function mockCheckout() {
  await delay(900)
  return { success: true }
}
