'use client'
import './UniversalDisplay.css';


export function ProductCard({ name, price, button, onAddToCart, item, image, rating }) {
  const handleClick = () => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  return (
    <div className="product-card-wrapper">
      {/* Floating Image Section */}
      <div className="product-floating-image">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          // White placeholder if no image
          <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }}></div>
        )}
      </div>

      {/* Card Body */}
      <div className="product-card-body">
        <h3 className="product-title">{name}</h3>

        <div className="product-meta">
          {/* Group 1: Rating (Top) */}
          {/* Group 1: Rating (Top) */}
          <div className="product-rating-badge">
            <span className="rating-star">★</span>
            <span className="rating-value">{rating || '4.2'}</span>
          </div>

          {/* Group 2: Price (Bottom) */}
          <div>
            <span>RS:{price}</span>
          </div>
        </div>

        <button className="product-add-btn" onClick={handleClick}>
          {button || 'ADD'}
        </button>
      </div>
    </div>
  );
}
