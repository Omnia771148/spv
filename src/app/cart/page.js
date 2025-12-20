'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [itemTotals, setItemTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // ✅ quantity state
  const aa  =  "gg";

  // ✅ Authentication check
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  // ✅ Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);

      // Initialize quantities state
      const initialQuantities = {};
      parsedCart.forEach(item => {
        initialQuantities[item.id] = item.quantity || 1;
      });
      setQuantities(initialQuantities);
    }
  }, []);

  // ✅ Calculate totals
  useEffect(() => {
    const totals = {};
    cartItems.forEach(item => {
      totals[item.id] = item.price * (quantities[item.id] || 1);
    });
    setItemTotals(totals);
  }, [cartItems, quantities]);

  // ✅ Clear cart
  function clear() {
    localStorage.removeItem('cart');
    setCartItems([]);
    setItemTotals({});
    setQuantities({});
  }

  // ✅ Remove item
  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    const updatedQuantities = { ...quantities };
    delete updatedQuantities[id];
    setQuantities(updatedQuantities);
  };

  // ✅ Update quantity using useState
  const updateQuantity = (id, delta) => {
    setQuantities(prev => {
      const newQty = (prev[id] || 1) + delta;
      return {
        ...prev,
        [id]: newQty > 0 ? newQty : 1,
      };
    });
  };

  // ✅ Place order
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const restaurantId = cartItems[0].restid;

      const orderItems = cartItems.map((item) => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: quantities[item.id] || 1,
      }));

      await axios.post('/api/orders', {
        userId,
        items: orderItems,
        restaurantId,
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

  if (loading) return <p>Checking authentication...</p>;

  return (
    <div className="mt-4">
      <h2>Cart</h2>

      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <ul className="list-unstyled">
          {cartItems.map((item) => (
            <li key={item.id} className="mb-2">
              {item.name} - ₹{item.price} x {quantities[item.id] || 1}

              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="btn btn-sm btn-secondary ms-2"
              >
                -
              </button>

              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="btn btn-sm btn-secondary ms-1"
              >
                +
              </button>

              <button
                onClick={() => removeItem(item.id)}
                className="btn btn-sm btn-danger ms-2"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <h4 className="mt-3">Total: ₹{totalPrice}</h4>

      <button onClick={clear} className="btn btn-warning mt-3 me-3">
        Clear All
      </button>

      <button onClick={placeOrder} className="btn btn-primary mt-3">
        Place Order
      </button>

      <div className="mt-3">
        <button onClick={() => window.location.href = "/accepted-orders"} className="btn btn-info">
          ORDERS
        </button>
      </div>
    </div>
  );
}
