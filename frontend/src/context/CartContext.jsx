import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import * as cartService from '../services/cartService.js'

const CartContext = createContext(null)
const LAST_ORDER_KEY = 'hb_last_order'
const AUTO_CLOSE_DELAY = 1800

function readPersistedOrder() {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistOrder(order) {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
  } catch {
    // storage unavailable (private mode, quota, etc.) — order still lives in memory
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [lastOrder, setLastOrder] = useState(readPersistedOrder)
  const autoCloseTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(autoCloseTimerRef.current), [])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prev, { product, quantity }]
    })
    cartService.addToCart({ productId: product.id, quantity }).catch(() => {})
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    )
  }, [])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), [])

  const startCheckout = useCallback(() => {
    setIsReviewing((prev) => prev || items.length > 0)
  }, [items.length])

  const cancelCheckout = useCallback(() => setIsReviewing(false), [])

  const confirmOrder = useCallback(async () => {
    if (items.length === 0) return
    setIsCheckingOut(true)
    try {
      const response = await cartService.checkout({ items })
      const order = {
        id: response.order_id,
        items: response.items ?? items.map(({ product, quantity }) => ({ ...product, quantity })),
        total: response.total ?? items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
        createdAt: response.created_at ?? new Date().toISOString(),
        status: 'completed',
      }
      setLastOrder(order)
      persistOrder(order)
      setIsReviewing(false)
      setOrderSuccess(true)
      setItems([])

      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = setTimeout(() => {
        setIsDrawerOpen(false)
        setOrderSuccess(false)
      }, AUTO_CLOSE_DELAY)
    } finally {
      setIsCheckingOut(false)
    }
  }, [items])

  const resetOrderSuccess = useCallback(() => {
    clearTimeout(autoCloseTimerRef.current)
    setOrderSuccess(false)
  }, [])

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isReviewing,
      startCheckout,
      cancelCheckout,
      confirmOrder,
      isCheckingOut,
      orderSuccess,
      resetOrderSuccess,
      lastOrder,
      totalCount,
      totalPrice,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isReviewing,
      startCheckout,
      cancelCheckout,
      confirmOrder,
      isCheckingOut,
      orderSuccess,
      resetOrderSuccess,
      lastOrder,
      totalCount,
      totalPrice,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
