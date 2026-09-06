import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { IconSend } from '../icons/Icons.jsx'
import styles from './ChatInput.module.css'

function ChatInput({ onSend, disabled }) {
  const { t } = useLanguage()
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend?.(trimmed)
    setValue('')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t.ai.placeholder}
        aria-label={t.ai.placeholder}
        disabled={disabled}
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
