import { useLanguage } from '../../context/LanguageContext.jsx'
import { useChat } from '../../context/ChatContext.jsx'
import HeroCosmetics from '../HeroCosmetics/HeroCosmetics.jsx'
import HeroModel from '../HeroModel/HeroModel.jsx'
import { IconChat, IconArrowRight } from '../icons/Icons.jsx'
import styles from './Hero.module.css'

function Hero() {
  const { t } = useLanguage()
  const { open } = useChat()

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <span className={styles.blobLeft} aria-hidden="true" />
      <span className={styles.blobRight} aria-hidden="true" />

      <HeroCosmetics />

      <div className={`container ${styles.contentOuter}`}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>AI Beauty Consultant</span>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.titleLine1}>{t.hero.titleLine1}</span>
            <span className={styles.titleLine2}>{t.hero.titleLine2}</span>
          </h1>
          <p className={styles.description}>{t.hero.description}</p>
          <button type="button" className={styles.cta} onClick={open}>
            <IconChat width={18} height={18} />
            {t.hero.cta}
            <IconArrowRight width={18} height={18} />
          </button>
        </div>
      </div>

      <HeroModel />
    </section>
  )
}

export default Hero
