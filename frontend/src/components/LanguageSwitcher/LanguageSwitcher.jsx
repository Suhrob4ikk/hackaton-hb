import { useLanguage } from '../../context/LanguageContext.jsx'
import styles from './LanguageSwitcher.module.css'

const LANGUAGES = [
  { code: 'ru', label: 'РУС' },
  { code: 'tj', label: 'ТҶ' },
]

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={styles.switcher} role="group" aria-label="Язык / Забон">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`${styles.option} ${language === code ? styles.optionActive : ''}`}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
