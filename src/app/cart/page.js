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

  // ✅ UPDATED Place Order Logic
  const placeOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");

    try {
      // 1. Prepare Order Data Payload
      const latStr = localStorage.getItem("customerLat");
      const lngStr = localStorage.getItem("customerLng");
      const mapUrl = localStorage.getItem("customerLocationUrl");

      const orderPayload = {
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
          lat: latStr ? Number(latStr) : 0,
          lng: lngStr ? Number(lngStr) : 0,
          mapUrl: mapUrl || ""
        }
      };

      // 2. Call Create Order to get Razorpay ID ONLY
      const { data } = await axios.post('/api/create-order', {
        grandTotal: orderPayload.grandTotal 
      });

      if (!data.success) {
        throw new Error(data.message || "Order creation failed");
      }

      // 3. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: Math.round(Number(grandTotal) * 100), 
        currency: "INR",
        name: "My Delivery App",
        description: "Payment for food order",
        order_id: data.razorpayOrderId,
        
        // Success Handler
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderPayload 
            });

            if (verifyRes.data.success) {
              alert('Order Paid & Placed Successfully!');
              clear();
              router.push("/accepted-orders");
            } else {
              alert('Payment verification failed. Order not saved.');
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: "Customer",
          contact: "9999999999"
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);

      // ✅ ADDED & FIXED: Safe Listener for Payment Failures
      rzp.on('payment.failed', async function (response) {
        // 1. Log the full error clearly so you can see it in console
        console.error("Payment Failed Details:", JSON.stringify(response.error));
        
        // 2. Safe access to description (handles "undefined" if popup is just closed)
        const errDesc = response.error?.description || "Payment cancelled or failed";
        alert(`Payment Failed: ${errDesc}`);

        try {
            // 3. Send failure details to your new API
            await axios.post('/api/log-failed-payment', {
                error_code: response.error?.code || "UNKNOWN",
                error_description: errDesc,
                // Safe access to metadata
                razorpay_order_id: response.error?.metadata?.order_id || data.razorpayOrderId, 
                razorpay_payment_id: response.error?.metadata?.payment_id || "N/A",
                orderData: orderPayload
            });
            console.log("Failed order logged to DB");
        } catch (logErr) {
            console.error("Could not log failed order", logErr);
        }
      });

      rzp.open();

    } catch (err) {
      console.error('Payment initialization error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Payment Error: ${errorMsg}`);
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