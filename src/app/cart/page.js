'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import Script from 'next/script'; // ✅ Import Script to load Razorpay

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

  const totalPrice = Object.values(itemTotals).reduce((acc, val) => acc + val, 0);
  const gstAmount = totalPrice * 0.05;
  const deliveryCharge = 40;
  const grandTotal = totalPrice + gstAmount + deliveryCharge;

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
  };

  const updateQuantity = (id, delta) => {
    setQuantities(prev => {
      const newQty = (prev[id] || 1) + delta;
      return { ...prev, [id]: newQty > 0 ? newQty : 1 };
    });
  };

  // ✅ UPDATED: Place order now triggers Razorpay with verification
  const placeOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");

    try {
      // 1. Create the Order in DB and Razorpay
      const { data } = await axios.post('/api/create-order', {
        userId: localStorage.getItem('userId'),
        items: cartItems.map(item => ({
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: quantities[item.id] || 1
        })),
        restaurantId: cartItems[0].restid,
        totalCount: cartItems.length,
        totalPrice,
        gst: gstAmount,
        deliveryCharge,
        grandTotal,
        aa,
      });

      if (!data.success) {
        alert("Order initialization failed!");
        return;
      }

      // 2. Configure and open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(grandTotal * 100), // amount in paise
        currency: "INR",
        name: "My Delivery App",
        description: "Payment for food order",
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment after user pays
            const verifyRes = await axios.post('/api/verify-payment', {
              ...response,
              dbOrderId: data.dbOrderId
            });

            if (verifyRes.data.success) {
              alert('Order Paid & Placed Successfully!');
              clear();
              router.push("/accepted-orders");
            } else {
              alert('Payment verification failed.');
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: "Customer Name",
          contact: "9999999999"
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment initialization error:', err);
      alert("Error starting payment flow");
    }
  };

  if (loading) return <p>Checking authentication...</p>;

  return (
    <div className="mt-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

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
      <button onClick={placeOrder} className="btn btn-primary mt-3">Pay & Place Order</button>
    </div>
  );
}