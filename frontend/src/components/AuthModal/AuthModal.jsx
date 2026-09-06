import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { IconClose } from '../icons/Icons.jsx'
import styles from './AuthModal.module.css'

function AuthModal() {
  const { t } = useLanguage()
  const { isModalOpen, closeModal, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  if (!isModalOpen) return null

  function resetFields() {
    setName('')
    setEmail('')
    setPassword('')
    setError('')
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  function handleClose() {
    resetFields()
    closeModal()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsPending(true)
    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        await register({ email, password, name })
      }
      resetFields()
      closeModal()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose} aria-hidden="true" />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={t.auth.account}>
        <button type="button" className={styles.closeButton} aria-label={t.auth.close} onClick={handleClose}>
          <IconClose width={18} height={18} />
        </button>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchMode('login')}
          >
            {t.auth.loginTab}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => switchMode('register')}
          >
            {t.auth.registerTab}
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className={styles.field}>
              <span>{t.auth.nameLabel}</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.auth.namePlaceholder}
                required
              />
            </label>
          )}

          <label className={styles.field}>
            <span>{t.auth.emailLabel}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.auth.emailPlaceholder}
              required
            />
          </label>

          <label className={styles.field}>
            <span>{t.auth.passwordLabel}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              minLength={6}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={isPending}>
            {mode === 'login'
              ? (isPending ? t.auth.loginPending : t.auth.loginSubmit)
              : (isPending ? t.auth.registerPending : t.auth.registerSubmit)}
          </button>
        </form>
      </div>
    </>
  )
}

export default AuthModal
