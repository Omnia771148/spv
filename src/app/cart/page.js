'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import Script from 'next/script'; 

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [itemTotals, setItemTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const aa = "gg";

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

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

  const updateQuantity = (id, delta) => {
    setQuantities(prev => {
      const newQty = (prev[id] || 1) + delta;
      return { ...prev, [id]: newQty > 0 ? newQty : 1 };
    });
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");

    // 1. Get location from localStorage
    const latStr = localStorage.getItem("customerLat");
    const lngStr = localStorage.getItem("customerLng");
    const mapUrl = localStorage.getItem("customerLocationUrl");

    // 🛑 VALIDATION: Prevent 500 error by ensuring data exists
    if (!mapUrl || !latStr || !lngStr) {
      alert("Location not verified. Please allow location access on the restaurant list page.");
      return;
    }

    try {
      // 2. Create the Order
      const { data } = await axios.post('/api/create-order', {
        userId: localStorage.getItem('userId'),
        items: cartItems.map(item => ({
          itemId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(quantities[item.id] || 1)
        })),
        restaurantId: String(cartItems[0].restid),
        totalCount: cartItems.length,
        totalPrice: Number(totalPrice),
        gst: Number(gstAmount),
        deliveryCharge: Number(deliveryCharge),
        grandTotal: Number(grandTotal),
        aa,
        location: {
          lat: Number(latStr),
          lng: Number(lngStr),
          mapUrl: mapUrl
        }
      });

      if (!data.success) throw new Error(data.message);

      // 3. Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: Math.round(Number(grandTotal) * 100), 
        currency: "INR",
        name: "Kurnool Delivery",
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          const verifyRes = await axios.post('/api/verify-payment', {
            ...response,
            dbOrderId: data.dbOrderId
          });

          if (verifyRes.data.success) {
            alert('Order Placed!');
            clear();
            router.push("/accepted-orders");
          }
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment Error:', err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h2>Your Cart</h2>
      {cartItems.map(item => (
        <div key={item.id} className="d-flex justify-content-between border-bottom py-2">
          <span>{item.name} x {quantities[item.id]}</span>
          <div>
            <button onClick={() => updateQuantity(item.id, -1)} className="btn btn-sm btn-light">-</button>
            <button onClick={() => updateQuantity(item.id, 1)} className="btn btn-sm btn-light">+</button>
          </div>
        </div>
      ))}
      <div className="mt-4 p-3 bg-light rounded">
        <p>Grand Total: <strong>₹{grandTotal.toFixed(2)}</strong></p>
        <button onClick={placeOrder} className="btn btn-primary w-100">Pay & Place Order</button>
      </div>
    </div>
  );
}