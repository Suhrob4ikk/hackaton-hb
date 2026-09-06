import { createContext, useContext, useMemo, useState } from 'react'
import translations from '../data/translations.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children, defaultLanguage = 'ru' }) {
  const [language, setLanguage] = useState(defaultLanguage)

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language] ?? translations.ru,
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
