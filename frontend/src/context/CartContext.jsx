import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import * as cartService from '../services/cartService.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

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

  const checkout = useCallback(async () => {
    setIsCheckingOut(true)
    try {
      await cartService.checkout({ items, token: user?.token })
      setOrderSuccess(true)
      setItems([])
    } finally {
      setIsCheckingOut(false)
    }
  }, [items, user])

  const resetOrderSuccess = useCallback(() => setOrderSuccess(false), [])

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
      checkout,
      isCheckingOut,
      orderSuccess,
      resetOrderSuccess,
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
      checkout,
      isCheckingOut,
      orderSuccess,
      resetOrderSuccess,
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
