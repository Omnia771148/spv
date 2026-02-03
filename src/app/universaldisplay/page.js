'use client'
import './UniversalDisplay.css';
import { useState, useEffect } from 'react';


export function ProductCard({ name, price, button, onAddToCart, item, image, rating, disabled }) {
  const [quantity, setQuantity] = useState(0);

  // Check if item is already in cart on mount and listen for updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartItem = cart.find(cartItem => cartItem.id === item.id);
        if (cartItem) {
          setQuantity(cartItem.quantity || 1);
        } else {
          setQuantity(0);
        }
      };

      checkCart();

      // Listen for cart updates from other components
      window.addEventListener('cartUpdated', checkCart);
      return () => window.removeEventListener('cartUpdated', checkCart);
    }
  }, [item.id]);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(item);
      // After parent handler, check if it was added to update our state
      if (!disabled) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const exists = cart.find(c => c.id === item.id);
        if (exists) {
          setQuantity(exists.quantity || 1);
        }
      }
    }
  };

  const updateQuantity = (newQty) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let updatedCart;

    if (newQty <= 0) {
      updatedCart = cart.filter(c => c.id !== item.id);
      setQuantity(0);
    } else {
      updatedCart = cart.map(c => c.id === item.id ? { ...c, quantity: newQty } : c);
      setQuantity(newQty);
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
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

        {quantity > 0 ? (
          <div className="quantity-controls">
            <button className="qty-btn" onClick={() => updateQuantity(quantity - 1)}>-</button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={() => updateQuantity(quantity + 1)}>+</button>
          </div>
        ) : (
          <button
            className={`product-add-btn`}
            onClick={handleAdd}
          >
            {button || 'ADD'}
          </button>
        )}
      </div>
    </div>
  );
}