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
  
  // Kept your delivery states
  const [deliveryCharge, setDeliveryCharge] = useState(40); 
  const [distance, setDistance] = useState(0);
  
  // Address States
  const [deliveryAddress, setDeliveryAddress] = useState(""); 
  const [showAddressBox, setShowAddressBox] = useState(false);

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

  // Load cart & Distance (Reads from your localStorage)
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

    const savedDistance = localStorage.getItem("deliveryDistanceKm");
    if (savedDistance) {
      const dist = parseFloat(savedDistance);
      setDistance(dist);
      
      if (dist <= 3) {
        setDeliveryCharge(30);
      } else {
        const extraKm = Math.ceil(dist - 3);
        setDeliveryCharge(30 + (extraKm * 10));
      }
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
  const grandTotal = totalPrice + gstAmount + deliveryCharge;

  const clear = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    setItemTotals({});
    setQuantities({});
    setShowAddressBox(false);
    setDeliveryAddress("");
  };

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

  const placeOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");
    if (!deliveryAddress.trim()) return alert("Please enter delivery address");

    try {
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
        deliveryAddress, // Included the user's manual address
        aa,
        location: {
          lat: latStr ? Number(latStr) : 0,
          lng: lngStr ? Number(lngStr) : 0,
          mapUrl: mapUrl || "",
          distanceText: `${distance} km`
        }
      };

      const { data } = await axios.post('/api/create-order', {
        grandTotal: orderPayload.grandTotal 
      });

      if (!data.success) throw new Error(data.message || "Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: Math.round(Number(grandTotal) * 100), 
        currency: "INR",
        name: "My Delivery App",
        description: `Food Order - ${distance} km delivery`,
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderPayload 
            });

            if (verifyRes.data.success) {
              alert('Order Placed Successfully!');
              clear();
              router.push("/accepted-orders");
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
          }
        },
        prefill: { contact: "9999999999" },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Payment initialization error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p className="text-center mt-5">Checking authentication...</p>;

  return (
    <div className="container mt-4 mb-5" style={{ maxWidth: '600px' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h2 className="fw-bold mb-4">Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
            <p className="text-muted h5">No items in the cart.</p>
            <button onClick={() => router.push('/')} className="btn btn-primary mt-3 btn-sm">Browse Restaurants</button>
        </div>
      ) : (
        <>
          <ul className="list-group mb-4 shadow-sm">
            {cartItems.map(item => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                <div>
                  <strong className="d-block">{item.name}</strong>
                  <small className="text-muted">₹{item.price} x {quantities[item.id]}</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="btn-group me-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="btn btn-outline-secondary btn-sm px-2">-</button>
                    <span className="btn btn-sm disabled border-secondary text-dark px-3">{quantities[item.id]}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="btn btn-outline-secondary btn-sm px-2">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="btn btn-link text-danger p-0" title="Remove">
                    <small>Remove</small>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="card shadow-sm border-0 bg-light mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Bill Details</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Item Total</span>
                <span className="small">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">GST (5%)</span>
                <span className="small">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Delivery Fee ({distance} km)</span>
                <span className="small">₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold text-primary">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Buttons come directly below Grand Total */}
          <div className="d-flex gap-2 mb-3">
            <button onClick={clear} className="btn btn-outline-warning flex-grow-1 py-2">Clear All</button> 
            <button onClick={() => setShowAddressBox(true)} className="btn btn-primary flex-grow-1 py-2 fw-bold">
                Place Order 
            </button>
          </div>

          {/* Address Box appears BELOW the buttons when Place Order is clicked */}
          {showAddressBox && (
            <div className="card p-3 border-0 shadow-sm bg-white mt-3">
              <label className="fw-bold mb-2">Delivery Address</label>
              <textarea 
                className="form-control mb-3" 
                placeholder="Write your Flat No, Landmark, and Street so the rider can find you easily..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows="3"
                autoFocus
              />
              <button onClick={placeOrder} className="btn btn-success w-100 py-2 fw-bold">
                Confirm Order & Pay
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}