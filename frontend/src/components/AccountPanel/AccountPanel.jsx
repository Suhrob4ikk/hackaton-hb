import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiGetPurchases } from '../../services/api.js'
import { gradientForId } from '../../utils/placeholderColor.js'
import { IconClose } from '../icons/Icons.jsx'
import styles from './AccountPanel.module.css'

function formatDate(isoString, locale) {
  try {
    return new Date(isoString).toLocaleDateString(locale === 'tj' ? 'ru-RU' : 'ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return isoString
  }
}

function AccountPanel() {
  const { t, language } = useLanguage()
  const { isAccountOpen, closeAccount, user, logout } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | ready | error

  useEffect(() => {
    if (!isAccountOpen || !user) return
    let cancelled = false
    setStatus('loading')
    apiGetPurchases(user.token)
      .then((data) => {
        if (cancelled) return
        setPurchases(data.purchases || [])
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [isAccountOpen, user])

  return (
    <>
      <div
        className={`${styles.backdrop} ${isAccountOpen ? styles.backdropOpen : ''}`}
        onClick={closeAccount}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${isAccountOpen ? styles.drawerOpen : ''}`}
        aria-label={t.account.title}
        aria-hidden={!isAccountOpen}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{t.account.title}</h2>
          <button type="button" className={styles.closeButton} aria-label={t.auth.close} onClick={closeAccount}>
            <IconClose width={18} height={18} />
          </button>
        </div>

        {user && (
          <div className={styles.userBlock}>
            <div>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
            <button type="button" className={styles.logoutButton} onClick={logout}>
              {t.auth.logout}
            </button>
          </div>
        )}

        <h3 className={styles.sectionTitle}>{t.account.purchaseHistory}</h3>

        <div className={styles.body}>
          {status === 'loading' && <p className={styles.status}>{t.account.loading}</p>}
          {status === 'error' && <p className={styles.status}>{t.account.loadError}</p>}
          {status === 'ready' && purchases.length === 0 && <p className={styles.status}>{t.account.empty}</p>}

          {status === 'ready' && purchases.map((item, index) => (
            <div className={styles.item} key={`${item.id}-${item.purchased_at}-${index}`}>
              <span
                className={styles.itemImage}
                style={{ background: item.image_url ? undefined : gradientForId(item.id) }}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} />
                ) : (
                  item.title.charAt(0).toUpperCase()
                )}
              </span>
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>{item.title}</p>
                <p className={styles.itemMeta}>
                  {t.account.quantity}: {item.quantity} · {t.account.purchasedOn} {formatDate(item.purchased_at, language)}
                </p>
                {item.depletion_estimate && (
                  <p className={styles.itemDepletion}>
                    {t.account.depletionLabel}: {item.depletion_estimate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}

export default AccountPanel
