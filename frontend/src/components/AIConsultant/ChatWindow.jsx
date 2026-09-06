import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { sendChatMessage, getCheaperAlternative } from '../../services/chatService.js'
import ChatMessage from '../ChatMessage/ChatMessage.jsx'
import ChatInput from '../ChatInput/ChatInput.jsx'
import ChatWelcome from './ChatWelcome.jsx'
import { IconSparkle, IconClose } from '../icons/Icons.jsx'
import styles from './ChatWindow.module.css'

let messageIdCounter = 0
function nextId() {
  messageIdCounter += 1
  return `msg-${messageIdCounter}`
}

function ChatWindow({ onClose }) {
  const { t, language } = useLanguage()
  const { addItem } = useCart()
  const [messages, setMessages] = useState([])
  const [isSending, setIsSending] = useState(false)
  const [addedProductIds, setAddedProductIds] = useState(new Set())
  const [cheaperLoadingId, setCheaperLoadingId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  function replaceTypingWith(entry) {
    setMessages((prev) => {
      const withoutTyping = prev.filter((message) => !message.isTyping)
      return [...withoutTyping, { id: nextId(), ...entry }]
    })
  }

  async function handleSend(text) {
    const hasHistory = messages.some((message) => message.role === 'user')
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text },
      { id: nextId(), role: 'assistant', isTyping: true },
    ])
    setIsSending(true)

    try {
      const { reply, products } = await sendChatMessage({ message: text, language, hasHistory })
      replaceTypingWith({ role: 'assistant', text: reply, products })
    } catch {
      replaceTypingWith({ role: 'assistant', text: t.ai.error, isError: true })
    } finally {
      setIsSending(false)
    }
  }

  async function handleCheaper(product) {
    setCheaperLoadingId(product.id)
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: t.ai.cheaperUserLine },
      { id: nextId(), role: 'assistant', isTyping: true },
    ])

    try {
      const { reply, products } = await getCheaperAlternative({ productId: product.id })
      replaceTypingWith({ role: 'assistant', text: reply, products })
    } catch {
      replaceTypingWith({ role: 'assistant', text: t.ai.error, isError: true })
    } finally {
      setCheaperLoadingId(null)
    }
  }

  function handleAddToCart(product) {
    addItem(product, 1)
    setAddedProductIds((prev) => new Set(prev).add(product.id))
  }

  return (
    <section className={styles.panel} role="dialog" aria-label={`${t.ai.brand} — ${t.ai.role}`}>
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          <IconSparkle width={18} height={18} />
        </span>
        <div className={styles.titleBlock}>
          <p className={styles.brandName}>{t.ai.brand}</p>
          <p className={styles.role}>{t.ai.role}</p>
        </div>
        <button type="button" className={styles.closeButton} aria-label={t.ai.closeChat} onClick={onClose}>
          <IconClose width={16} height={16} />
        </button>
      </header>

      <div className={styles.messages}>
        {messages.length === 0 ? (
          <ChatWelcome onQuickAction={handleSend} />
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAddToCart={handleAddToCart}
                onCheaper={handleCheaper}
                addedProductIds={addedProductIds}
                cheaperLoadingId={cheaperLoadingId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={isSending} />
    </section>
  )
}

export default ChatWindow
