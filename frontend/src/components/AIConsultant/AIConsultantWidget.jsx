import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useChat } from '../../context/ChatContext.jsx'
import ChatWindow from './ChatWindow.jsx'
import { IconSparkle, IconClose } from '../icons/Icons.jsx'
import styles from './AIConsultantWidget.module.css'

const BUTTON_SIZE = 64
const EDGE_MARGIN = 12
const DRAG_THRESHOLD = 5

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function AIConsultantWidget() {
  const { t } = useLanguage()
  const { isOpen, close, toggle } = useChat()
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [showBubble, setShowBubble] = useState(false)

  const isDraggingRef = useRef(false)
  const movedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

  useEffect(() => {
    const showTimer = setTimeout(() => setShowBubble(true), 1500)
    const hideTimer = setTimeout(() => setShowBubble(false), 10500)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    if (isOpen) setShowBubble(false)
  }, [isOpen])

  function handlePointerDown(event) {
    if (isOpen) return
    isDraggingRef.current = true
    movedRef.current = false
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    if (!isDraggingRef.current) return
    const dx = event.clientX - dragStartRef.current.x
    const dy = event.clientY - dragStartRef.current.y

    if (!movedRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      movedRef.current = true
    }

    if (movedRef.current) {
      const minX = EDGE_MARGIN - window.innerWidth + 28 + BUTTON_SIZE
      const maxX = 28 - EDGE_MARGIN
      const minY = EDGE_MARGIN - window.innerHeight + 28 + BUTTON_SIZE
      const maxY = 28 - EDGE_MARGIN

      setOffset({
        x: clamp(dragStartRef.current.offsetX + dx, minX, maxX),
        y: clamp(dragStartRef.current.offsetY + dy, minY, maxY),
      })
    }
  }

  function handlePointerUp(event) {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (movedRef.current) {
      suppressClickRef.current = true
    }
  }

  function handleTriggerClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    setShowBubble(false)
    toggle()
  }

  return (
    <div
      className={styles.container}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <div className={`${styles.panelWrap} ${isOpen ? styles.panelWrapOpen : ''}`}>
        <ChatWindow onClose={close} />
      </div>

      <div className={`${styles.triggerWrap} ${isOpen ? styles.triggerWrapHidden : ''}`}>
        {showBubble && (
          <div className={styles.bubble} role="status">
            <button
              type="button"
              className={styles.bubbleClose}
              aria-label={t.ai.closeBubble}
              onClick={() => setShowBubble(false)}
            >
              <IconClose width={13} height={13} />
            </button>
            {t.ai.greeting}
          </div>
        )}

        <button
          type="button"
          className={styles.triggerButton}
          aria-label={t.hero.cta}
          aria-expanded={isOpen}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleTriggerClick}
        >
          <IconSparkle width={24} height={24} />
          <span className={styles.onlineDot} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default AIConsultantWidget
