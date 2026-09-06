import { useLanguage } from '../../context/LanguageContext.jsx'
import styles from './Footer.module.css'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer id="footer" className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandBlock}>
          <span className={styles.brand}>
            <span className={styles.mark} aria-hidden="true" />
            <span className={styles.brandText}>HAYAT BEAUTY</span>
          </span>
          <p className={styles.about}>{t.footer.about}</p>
        </div>

        <div className={styles.contacts}>
          <p className={styles.contactsHeading}>{t.footer.contactsHeading}</p>
          <p>{t.footer.address}</p>
          <p>{t.footer.phone}</p>
        </div>
      </div>

      <p className={styles.bottom}>
        © {new Date().getFullYear()} HAYAT BEAUTY. {t.footer.rights}
      </p>
    </footer>
  )
}

export default Footer
