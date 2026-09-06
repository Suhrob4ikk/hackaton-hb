function Cart({ items = [] }) {
  return (
    <aside className="cart" aria-label="Корзина">
      <h2>Корзина</h2>
      <p>{items.length ? `Товаров: ${items.length}` : 'Корзина пока пуста'}</p>
    </aside>
  )
}

export default Cart
