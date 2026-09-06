import { useLanguage } from '../../context/LanguageContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { gradientForId } from '../../utils/placeholderColor.js'
import { IconClose, IconMinus, IconPlus, IconTrash } from '../icons/Icons.jsx'
import styles from './CartDrawer.module.css'

function CartDrawer() {
  const { t } = useLanguage()
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    checkout,
    isCheckingOut,
    orderSuccess,
    resetOrderSuccess,
    totalCount,
    totalPrice,
  } = useCart()

  function handleClose() {
    closeDrawer()
    if (orderSuccess) resetOrderSuccess()
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${isDrawerOpen ? styles.backdropOpen : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}
        aria-label={t.cart.title}
        aria-hidden={!isDrawerOpen}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{t.cart.title}</h2>
          <button type="button" className={styles.closeButton} aria-label={t.cart.close} onClick={handleClose}>
            <IconClose width={18} height={18} />
          </button>
        </div>

        {orderSuccess ? (
          <div className={styles.success}>
            <h3 className={styles.successTitle}>{t.cart.successTitle}</h3>
            <p className={styles.successText}>{t.cart.successText}</p>
            <button type="button" className={styles.continueButton} onClick={handleClose}>
              {t.cart.continueShopping}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.body}>
            <p className={styles.empty}>{t.cart.empty}</p>
          </div>
        ) : (
          <>
            <div className={styles.body}>
              {items.map(({ product, quantity }) => (
                <div className={styles.item} key={product.id}>
                  <span
                    className={styles.itemImage}
                    style={{ background: product.image_url ? undefined : gradientForId(product.id) }}
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} />
                    ) : (
                      product.title.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemTitle}>{product.title}</p>
                    <p className={styles.itemPrice}>
                      {product.price} {t.cart.currency}
                    </p>
                    <div className={styles.itemControls}>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        aria-label="-"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                      >
                        <IconMinus width={12} height={12} />
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        aria-label="+"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                      >
                        <IconPlus width={12} height={12} />
                      </button>
                      <button
                        type="button"
                        className={styles.removeButton}
                        aria-label={t.cart.remove}
                        onClick={() => removeItem(product.id)}
                      >
                        <IconTrash width={15} height={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalRow}>
                <span>
                  {t.cart.total} ({totalCount})
                </span>
                <span className={styles.totalValue}>
                  {totalPrice} {t.cart.currency}
                </span>
              </div>
              <button
                type="button"
                className={styles.checkoutButton}
                onClick={checkout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? t.cart.checkingOut : t.cart.checkout}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

export default CartDrawer
