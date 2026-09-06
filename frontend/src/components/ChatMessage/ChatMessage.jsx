import ProductCard from '../ProductCard/ProductCard.jsx'
import styles from './ChatMessage.module.css'

function ChatMessage({ message, onAddToCart, onCheaper, addedProductIds, cheaperLoadingId }) {
  const isUser = message.role === 'user'

  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}>
      {message.isTyping ? (
        <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
          <span className={styles.typingDots} aria-label="AI печатает">
            <span />
            <span />
            <span />
          </span>
        </div>
      ) : (
        message.text && (
          <div
            className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant} ${
              message.isError ? styles.bubbleError : ''
            }`}
          >
            {message.text}
          </div>
        )
      )}

      {message.products?.length > 0 && (
        <div className={styles.products}>
          {message.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onCheaper={onCheaper}
              isAdded={addedProductIds?.has(product.id)}
              isCheaperLoading={cheaperLoadingId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatMessage
