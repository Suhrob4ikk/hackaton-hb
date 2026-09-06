import { useLanguage } from '../../context/LanguageContext.jsx'
import { IconArrowRight } from '../icons/Icons.jsx'
import styles from './Categories.module.css'

const PLACEHOLDER_GRADIENTS = {
  face: 'linear-gradient(135deg, #f4b8d6 0%, #e9a9e0 45%, #c9a3f2 100%)',
  hair: 'linear-gradient(135deg, #ddd6fe 0%, #e9d5ff 50%, #fbcfe8 100%)',
  makeup: 'linear-gradient(135deg, #fda4af 0%, #fbcfe8 60%, #f3c9f2 100%)',
  body: 'linear-gradient(135deg, #fbe6f0 0%, #e9d5ff 60%, #ddd6fe 100%)',
  fragrance: 'linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 55%, #fbe6f0 100%)',
}

function Categories() {
  const { t } = useLanguage()

  return (
    <section id="categories" className={styles.section} aria-labelledby="categories-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="categories-title" className={styles.heading}>
            {t.categories.heading}
          </h2>
          <a className={styles.viewAll} href="#categories">
            {t.categories.viewAll}
            <IconArrowRight width={16} height={16} />
          </a>
        </div>

        <div className={styles.grid}>
          {t.categories.items.map((category) => (
            <a
              className={`${styles.card} ${category.featured ? styles.cardFeatured : ''}`}
              href="#categories"
              key={category.id}
            >
              <span
                className={styles.visual}
                style={{ background: PLACEHOLDER_GRADIENTS[category.id] ?? PLACEHOLDER_GRADIENTS.face }}
              >
                {category.image && <img src={category.image} alt="" />}
              </span>
              <span className={`${styles.body} ${category.featured ? styles.bodyFeatured : ''}`}>
                <span className={styles.title}>{category.title}</span>
                {category.featured && category.subtitle && (
                  <span className={styles.subtitle}>{category.subtitle}</span>
                )}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories
