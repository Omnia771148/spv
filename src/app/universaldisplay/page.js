'use client'
import './UniversalDisplay.css';
import { useState, useEffect } from 'react';


export function ProductCard({ name, price, button, onAddToCart, item, image, rating, disabled }) {
  const [isAdded, setIsAdded] = useState(false);

  // Check if item is already in cart on mount
  useEffect(() => {
    // Ensure we are in browser environment
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const exists = cart.some(cartItem => cartItem.id === item.id);
      if (exists) {
        setIsAdded(true);
      }
    }
  }, [item.id]);

  const handleClick = () => {
    if (onAddToCart) {
      onAddToCart(item);
      if (!disabled) {
        setIsAdded(true);
      }
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
          <div className="product-rating-badge">
            <span className="rating-star">★</span>
            <span className="rating-value">{rating || '4.2'}</span>
          </div>

          {/* Group 2: Price (Bottom) */}
          <div>
            <span>RS:{price}</span>
          </div>
        </div>

        <button
          className={`product-add-btn ${isAdded ? 'added' : ''}`}
          onClick={handleClick}
          style={isAdded ? { backgroundColor: '#28a745', color: 'white' } : {}}
        >
          {isAdded ? (
            <>
              Added <i className="fa-solid fa-check" style={{ marginLeft: '5px' }}></i>
            </>
          ) : (
            button || 'ADD'
          )}
        </button>
      </div>
    </div>
  );
}
