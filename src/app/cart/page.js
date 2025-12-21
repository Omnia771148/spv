'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [itemTotals, setItemTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const aa = "gg";

  // Authentication check
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);

      const initialQuantities = {};
      parsedCart.forEach(item => {
        initialQuantities[item.id] = item.quantity || 1;
      });
      setQuantities(initialQuantities);
    }
  }, []);

  // Calculate totals
  useEffect(() => {
    const totals = {};
    cartItems.forEach(item => {
      totals[item.id] = item.price * (quantities[item.id] || 1);
    });
    setItemTotals(totals);
  }, [cartItems, quantities]);

  function clear() {
    localStorage.removeItem('cart');
    setCartItems([]);
    setItemTotals({});
    setQuantities({});
  }

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    const updatedQuantities = { ...quantities };
    delete updatedQuantities[id];
    setQuantities(updatedQuantities);
  };

  const updateQuantity = (id, delta) => {
    setQuantities(prev => {
      const newQty = (prev[id] || 1) + delta;
      return { ...prev, [id]: newQty > 0 ? newQty : 1 };
    });
  };

  // Place order
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const restaurantId = cartItems[0].restid;

      const orderItems = cartItems.map(item => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: quantities[item.id] || 1,
      }));

      const totalPrice = Object.values(itemTotals).reduce((a, b) => a + b, 0);
      const gst = totalPrice * 0.05;         // ✅ NEW
      const deliveryCharge = 40;             // ✅ NEW
      const grandTotal = totalPrice + gst + deliveryCharge; // ✅ NEW

      await axios.post('/api/orders', {
        userId,
        items: orderItems,
        restaurantId,
        gst,                 // ✅ NEW
        deliveryCharge,      // ✅ NEW
        grandTotal,          // ✅ NEW
        aa,
      });

      alert('Order placed successfully!');
      clear();
    } catch (err) {
      console.error('Error sending order:', err);
      alert('Failed to place order.');
    }
  };

  const totalPrice = Object.values(itemTotals).reduce((acc, val) => acc + val, 0);
  const gstAmount = totalPrice * 0.05;
  const deliveryCharge = 40;
  const grandTotal = totalPrice + gstAmount + deliveryCharge;

  if (loading) return <p>Checking authentication...</p>;

  return (
    <div className="mt-4">
      <h2>Cart</h2>

      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <ul className="list-unstyled">
          {cartItems.map(item => (
            <li key={item.id} className="mb-2">
              {item.name} - ₹{item.price} x {quantities[item.id]}

              <button onClick={() => updateQuantity(item.id, -1)} className="btn btn-sm btn-secondary ms-2">-</button>
              <button onClick={() => updateQuantity(item.id, 1)} className="btn btn-sm btn-secondary ms-1">+</button>
              <button onClick={() => removeItem(item.id)} className="btn btn-sm btn-danger ms-2">Remove</button>
            </li>
          ))}
        </ul>
      )}

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5>Bill Details</h5>

          <div className="d-flex justify-content-between">
            <span>Item Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>GST (5%)</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>Delivery Charge</span>
            <span>₹40.00</span>
          </div>

          <hr />

          <div className="d-flex justify-content-between fw-bold">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button onClick={clear} className="btn btn-warning mt-3 me-3">Clear All</button>
      <button onClick={placeOrder} className="btn btn-primary mt-3">Place Order</button>
    </div>
  );
}
