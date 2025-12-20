'use client'
export function ProductCard({ name, price, button,onAddToCart, item }) {
  const handleClick = () => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  return (
    <div className="product-card">
      <div className="productcard">
        <h3 className="producttitle">{name}</h3>
        <p className="productprice">₹{price}</p>
        <button onClick={handleClick}>{button}</button>
      </div>
    </div>
  );
}
