function ProductRecommendation({ product }) {
  if (!product) return null

  return (
    <article className="product-recommendation">
      {product.image && <img src={product.image} alt={product.name} />}
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      {product.price && <strong>{product.price}</strong>}
    </article>
  )
}

export default ProductRecommendation
