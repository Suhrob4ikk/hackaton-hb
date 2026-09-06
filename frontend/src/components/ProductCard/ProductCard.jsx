import { useLanguage } from '../../context/LanguageContext.jsx'
import { gradientForId } from '../../utils/placeholderColor.js'
import styles from './ProductCard.module.css'

function ProductCard({ product, onAddToCart, onCheaper, isAdded, isCheaperLoading, hideCheaper = false }) {
  const { t } = useLanguage()

  if (!product) return null

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap} style={{ background: product.image_url ? undefined : gradientForId(product.id) }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} />
        ) : (
          <span className={styles.placeholderLetter} aria-hidden="true">
            {product.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <h4 className={styles.title}>{product.title}</h4>

      <div className={styles.metaRow}>
        <span className={styles.volume}>{product.volume}</span>
        <span className={styles.price}>
          {product.price} {t.cart.currency}
        </span>
      </div>

      {product.reason && <p className={styles.reason}>{product.reason}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.addButton} ${isAdded ? styles.addButtonDone : ''}`}
          onClick={() => onAddToCart?.(product)}
        >
          {isAdded ? t.ai.added : t.ai.addToCart}
        </button>
        {!hideCheaper && (
          <button
            type="button"
            className={styles.cheaperButton}
            onClick={() => onCheaper?.(product)}
            disabled={isCheaperLoading}
          >
            {t.ai.cheaperOption}
          </button>
        )}
      </div>
    </article>
  )
}

export default ProductCard
