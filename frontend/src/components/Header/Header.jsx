import { useLanguage } from '../../context/LanguageContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher.jsx'
import { IconSearch, IconCart, IconUser } from '../icons/Icons.jsx'
import styles from './Header.module.css'

function Header() {
  const { t } = useLanguage()
  const { totalCount, toggleDrawer } = useCart()
  const { isLoggedIn, user, openModal } = useAuth()

  const navItems = [
    { key: 'home', label: t.nav.home, href: '#top', active: true },
    { key: 'catalog', label: t.nav.catalog, href: '#categories' },
    { key: 'about', label: t.nav.about, href: '#benefits' },
    { key: 'contacts', label: t.nav.contacts, href: '#footer' },
  ]

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a className={styles.brand} href="#top" aria-label="HAYAT BEAUTY">
          <span className={styles.mark} aria-hidden="true" />
          <span className={styles.brandText}>
            HAYAT <span>BEAUTY</span>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Основная навигация">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <button
            type="button"
            className={`${styles.iconButton} ${styles.searchButton}`}
            aria-label={t.header.search}
          >
            <IconSearch />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t.header.cart}
            onClick={toggleDrawer}
          >
            <IconCart />
            {totalCount > 0 && <span className={styles.cartBadge}>{totalCount}</span>}
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={isLoggedIn ? `${t.auth.loggedInAs} ${user.name}` : t.header.profile}
            title={isLoggedIn ? `${t.auth.loggedInAs} ${user.name}` : undefined}
            onClick={openModal}
          >
            <IconUser />
            {isLoggedIn && <span className={styles.cartBadge} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
