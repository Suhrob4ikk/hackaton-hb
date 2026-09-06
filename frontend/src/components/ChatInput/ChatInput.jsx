import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { IconSend } from '../icons/Icons.jsx'
import styles from './ChatInput.module.css'

function ChatInput({ onSend, disabled }) {
  const { t } = useLanguage()
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend?.(trimmed)
    setValue('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={styles.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.ai.placeholder}
        aria-label={t.ai.placeholder}
        disabled={disabled}
        rows={1}
      />
      <button
        type="submit"
        className={styles.sendButton}
        aria-label={t.ai.send}
        disabled={disabled || !value.trim()}
      >
        <IconSend width={18} height={18} />
      </button>
    </form>
  )
}

export default ChatInput
