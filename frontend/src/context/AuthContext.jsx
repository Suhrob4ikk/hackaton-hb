import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { apiLogin, apiRegister } from '../services/api.js'

const AuthContext = createContext(null)

const STORAGE_KEY = 'hb_auth'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const persist = useCallback((nextUser) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const register = useCallback(async ({ email, password, name }) => {
    const result = await apiRegister({ email, password, name })
    persist(result)
    return result
  }, [persist])

  const login = useCallback(async ({ email, password }) => {
    const result = await apiLogin({ email, password })
    persist(result)
    return result
  }, [persist])

  const logout = useCallback(() => persist(null), [persist])

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), register, login, logout, isModalOpen, openModal, closeModal }),
    [user, register, login, logout, isModalOpen, openModal, closeModal],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
