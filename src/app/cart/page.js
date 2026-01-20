'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import Script from 'next/script';
import Loading from '../loading/page';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [itemTotals, setItemTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const [deliveryCharge, setDeliveryCharge] = useState(40);
  const [distance, setDistance] = useState(0);

  const [flatNo, setFlatNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [showAddressBox, setShowAddressBox] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

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
    let cartRestName = "";

    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);

      if (parsedCart.length > 0) {
        cartRestName = parsedCart[0].restaurantName || parsedCart[0].restName || "";
      }

      const initialQuantities = {};
      parsedCart.forEach(item => {
        initialQuantities[item.id] = item.quantity || 1;
      });
      setQuantities(initialQuantities);
    }

    const savedDistances = localStorage.getItem("allRestaurantDistances");

    if (savedDistances && cartRestName) {
      const distanceData = JSON.parse(savedDistances);

      const matchingKey = Object.keys(distanceData).find(
        key => key.toLowerCase().trim() === cartRestName.toLowerCase().trim()
      );

      const distValue = matchingKey ? distanceData[matchingKey] : null;

      if (distValue) {
        const dist = parseFloat(distValue);
        setDistance(dist);

        if (dist <= 3) {
          setDeliveryCharge(25);
        } else {
          const extraKm = Math.ceil(dist - 3);
          setDeliveryCharge(25 + (extraKm * 5));
        }
      } else {
        setDistance(0);
        setDeliveryCharge(25);
      }
    }

    // ✅ Load User Details into State
    setUserName(localStorage.getItem("userName") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
    setUserPhone(localStorage.getItem("userPhone") || "");
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
  const grandTotal = totalPrice + gstAmount + deliveryCharge;

  const clear = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    setItemTotals({});
    setQuantities({});
    setShowAddressBox(false);
    setFlatNo("");
    setStreet("");
    setLandmark("");
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
    const deliveryAddress = `${flatNo}, ${street} ${landmark ? ', ' + landmark : ''}`;
    if (!flatNo.trim() || !street.trim()) return alert("Please enter Flat No and Street address.");

    setLoading(true);

    try {
      const latStr = localStorage.getItem("customerLat");
      const lngStr = localStorage.getItem("customerLng");

      // ✅ Generate dynamic Google Maps link using coordinates
      const dynamicMapUrl = latStr && lngStr
        ? `https://www.google.com/maps/search/?api=1&query=${latStr},${lngStr}`
        : "";

      const orderPayload = {
        userId: localStorage.getItem('userId'),
        items: cartItems.map(item => ({
          itemId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(quantities[item.id] || 1)
        })),
        restaurantId: String(cartItems[0].restid || cartItems[0].restaurantName),
        totalCount: cartItems.length,
        totalPrice: Number(totalPrice),
        gst: Number(gstAmount),
        deliveryCharge: Number(deliveryCharge),
        grandTotal: Number(grandTotal),
        deliveryAddress: deliveryAddress,
        flatNo: flatNo.trim(),
        street: street.trim(),
        landmark: landmark.trim(),
        // ✅ User Details from State
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        aa: aa,
        location: {
          lat: latStr ? Number(latStr) : 0,
          lng: lngStr ? Number(lngStr) : 0,
          mapUrl: dynamicMapUrl,
          distanceText: `${distance} km`
        }
      };

      console.log("🚀 SENDING ORDER PAYLOAD:", orderPayload); // DEBUG LOG

      const { data } = await axios.post('/api/create-order', {
        grandTotal: orderPayload.grandTotal
      });

      if (!data.success) {
        setLoading(false);
        throw new Error(data.message || "Order creation failed");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(Number(grandTotal) * 100),
        currency: "INR",
        name: "My Delivery App",
        description: `Order from ${cartItems[0].restaurantName || "Restaurant"}`,
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
            } else {
              setLoading(false);
              alert(`Order verification failed: ${verifyRes.data.message}`);
            }
          } catch (verifyErr) {
            setLoading(false);
            alert(`Payment verification error: ${verifyErr.response?.data?.error || verifyErr.message}`);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone || "9999999999"
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setLoading(false);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <Loading />;
  }

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
                  <button onClick={() => removeItem(item.id)} className="btn btn-link text-danger p-0">
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
              <div className="d-flex justify-content-between mb-2 text-success fw-bold">
                <span className="small">Delivery Fee ({distance} km)</span>
                <span className="small">₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold text-primary">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mb-3">
            <button onClick={clear} className="btn btn-outline-warning flex-grow-1 py-2">Clear All</button>
            <button
              onClick={() => setShowAddressBox(true)}
              className="btn btn-primary flex-grow-1 py-2 fw-bold"
              disabled={showAddressBox}
            >
              {showAddressBox ? "Address Section Open" : "Place Order"}
            </button>
          </div>

          {showAddressBox && (
            <div className="card p-3 border-0 shadow-sm bg-white mt-3">
              <label className="fw-bold mb-2">Delivery Address</label>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Flat No / House No"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  autoFocus
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Street / Colony / Area"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
              <button onClick={placeOrder} className="btn btn-success w-100 py-2 fw-bold" disabled={loading}>
                {loading ? <Loading /> : `Confirm Order & Pay ₹${grandTotal.toFixed(2)}`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}