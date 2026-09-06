import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { getCatalogTop } from '../../services/catalogService.js'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import styles from './CatalogPage.module.css'

const GROUP_ORDER = ['face', 'hair', 'makeup', 'body', 'fragrance']

function CatalogPage({ focusGroup }) {
  const { t } = useLanguage()
  const { addItem } = useCart()
  const [groups, setGroups] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [addedIds, setAddedIds] = useState(new Set())

  useEffect(() => {
    let alive = true
    setGroups(null)
    setHasError(false)

    getCatalogTop({ limit: 8 })
      .then((data) => {
        if (alive) setGroups(data.groups)
      })
      .catch(() => {
        if (alive) setHasError(true)
      })

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!groups || !focusGroup) return
    const el = document.getElementById(`catalog-${focusGroup}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [groups, focusGroup])

  function handleAddToCart(product) {
    addItem(product, 1)
    setAddedIds((prev) => new Set(prev).add(product.id))
  }

  const categoryLabels = Object.fromEntries(t.categories.items.map((item) => [item.id, item.title]))

  return (
    <section className={styles.page} aria-labelledby="catalog-title">
      <div className="container">
        <div className={styles.head}>
          <h1 id="catalog-title" className={styles.heading}>
            {t.catalogPage.heading}
          </h1>
          <p className={styles.subheading}>{t.catalogPage.subheading}</p>
        </div>

        {hasError && <p className={styles.state}>{t.catalogPage.error}</p>}
        {!groups && !hasError && <p className={styles.state}>{t.catalogPage.loading}</p>}

        {groups &&
          GROUP_ORDER.map((groupKey) => {
            const products = groups[groupKey] || []
            return (
              <div className={styles.group} id={`catalog-${groupKey}`} key={groupKey}>
                <h2 className={styles.groupTitle}>{categoryLabels[groupKey]}</h2>
                {products.length === 0 ? (
                  <p className={styles.state}>{t.catalogPage.empty}</p>
                ) : (
                  <div className={styles.grid}>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        isAdded={addedIds.has(product.id)}
                        hideCheaper
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </section>
  )
}

export default CatalogPage
