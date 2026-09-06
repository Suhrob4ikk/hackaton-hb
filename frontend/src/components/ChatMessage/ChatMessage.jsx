import { useLanguage } from '../../context/LanguageContext.jsx'
import ProductCard from '../ProductCard/ProductCard.jsx'
import { IconLanguage, IconDocument, IconDownload } from '../icons/Icons.jsx'
import styles from './ChatMessage.module.css'

function ChatMessage({
  message,
  onAddToCart,
  onCheaper,
  addedProductIds,
  cheaperLoadingId,
  onSelectLanguage,
  onRetryPdf,
  onDownloadPdf,
}) {
  const { t } = useLanguage()
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
          <p className={styles.productsLabel}>{t.ai.recommendationsLabel}</p>
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

      {message.orderLanguagePrompt && (
        <div className={styles.languageChoice}>
          <button
            type="button"
            className={styles.languageButton}
            onClick={() => onSelectLanguage?.(message.orderLanguagePrompt.orderId, 'ru')}
          >
            <IconLanguage width={15} height={15} />
            {t.ai.languageRu}
          </button>
          <button
            type="button"
            className={styles.languageButton}
            onClick={() => onSelectLanguage?.(message.orderLanguagePrompt.orderId, 'tj')}
          >
            <IconLanguage width={15} height={15} />
            {t.ai.languageTj}
          </button>
        </div>
      )}

      {message.pdfCard && (
        <div className={styles.pdfCard}>
          <span className={styles.pdfIcon} aria-hidden="true">
            <IconDocument width={20} height={20} />
          </span>
          <p className={styles.pdfTitle}>{t.ai.pdfTitle}</p>
          <p className={styles.pdfCaption}>
            {message.pdfCard.language === 'ru' ? t.ai.pdfCaptionRu : t.ai.pdfCaptionTj}
          </p>

          {message.pdfCard.status === 'loading' && (
            <p className={styles.pdfStatus}>{t.ai.pdfPreparing}</p>
          )}

          {message.pdfCard.status === 'ready' && (
            <button
              type="button"
              className={styles.pdfDownloadButton}
              onClick={() => onDownloadPdf?.(message.pdfCard)}
            >
              <IconDownload width={15} height={15} />
              {t.ai.pdfDownload}
            </button>
          )}

          {message.pdfCard.status === 'error' && (
            <div className={styles.pdfErrorBlock}>
              <p className={styles.pdfError}>{t.ai.pdfError}</p>
              <button
                type="button"
                className={styles.pdfRetryButton}
                onClick={() => onRetryPdf?.(message.id, message.pdfCard.orderId, message.pdfCard.language)}
              >
                {t.ai.pdfRetry}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatMessage
