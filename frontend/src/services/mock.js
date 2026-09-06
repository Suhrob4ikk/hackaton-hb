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

export async function mockCheckout({ items }) {
  await delay(900)
  const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)
  return {
    success: true,
    order_id: `HB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
    total: Math.round(total * 100) / 100,
    items: items.map(({ product, quantity }) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      volume: product.volume ?? null,
      image_url: product.image_url ?? null,
      quantity,
      subtotal: Math.round(product.price * quantity * 100) / 100,
    })),
    created_at: new Date().toISOString(),
  }
}

export async function mockGetOrderInstructionsBlob() {
  await delay(500)
  throw new Error('PDF instructions are only available when the backend is connected.')
}

export async function mockGetCatalogTop() {
  await delay(400)
  const skinProducts = mockProducts.filter((product) => product.category !== 'hair')
  const hairProducts = mockProducts.filter((product) => product.category === 'hair')

  return {
    groups: {
      face: skinProducts,
      hair: hairProducts,
      makeup: skinProducts.slice().reverse(),
      body: skinProducts,
      fragrance: hairProducts,
    },
  }
}
