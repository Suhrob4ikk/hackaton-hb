import { useLanguage } from '../../context/LanguageContext.jsx'
import { IconSparkle, IconDroplet, IconLipstick, IconHairStrand, IconPerfume } from '../icons/Icons.jsx'
import styles from './ChatWelcome.module.css'

const ACTION_ICONS = {
  skincare: IconDroplet,
  makeup: IconLipstick,
  hair: IconHairStrand,
  fragrance: IconPerfume,
}

function ChatWelcome({ onQuickAction }) {
  const { t } = useLanguage()

  return (
    <div className={styles.welcome}>
      <span className={styles.mark} aria-hidden="true">
        <IconSparkle width={22} height={22} />
      </span>
      <h3 className={styles.title}>{t.ai.welcomeTitle}</h3>
      <p className={styles.subtitle}>{t.ai.welcomeSubtitle}</p>
      <p className={styles.description}>{t.ai.welcomeDescription}</p>

      <div className={styles.actions}>
        {t.ai.quickActions.map((action) => {
          const Icon = ACTION_ICONS[action.id]
          return (
            <button
              type="button"
              key={action.id}
              className={styles.actionButton}
              onClick={() => onQuickAction?.(action.prompt)}
            >
              {Icon && <Icon width={16} height={16} />}
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ChatWelcome
