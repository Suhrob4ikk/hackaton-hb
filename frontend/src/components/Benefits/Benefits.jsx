import { useLanguage } from '../../context/LanguageContext.jsx'
import { IconSparkle, IconShieldCheck, IconHeart, IconTruck } from '../icons/Icons.jsx'
import styles from './Benefits.module.css'

const ICONS = {
  sparkle: IconSparkle,
  shield: IconShieldCheck,
  heart: IconHeart,
  truck: IconTruck,
}

function Benefits() {
  const { t } = useLanguage()

  return (
    <section id="benefits" className={styles.section} aria-labelledby="benefits-title">
      <div className="container">
        <h2 id="benefits-title" className="visually-hidden">
          {t.benefits.heading}
        </h2>
        <div className={styles.grid}>
          {t.benefits.items.map((item) => {
            const Icon = ICONS[item.icon] ?? IconSparkle
            return (
              <article className={styles.item} key={item.id}>
                <span className={styles.iconCircle}>
                  <Icon width={26} height={26} strokeWidth={1.5} />
                </span>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Benefits
