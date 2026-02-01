'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../../lib/features/userSlice';
import axios from 'axios';
import Script from 'next/script';
import Loading from '../loading/page';
import { showToast } from '../../toaster/page';
import './cart.css';
import { restList } from '../restorentList/restorentDtata';

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

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // REDUX AUTH CHECK
  useEffect(() => {
    // If we're unsure yet (initial load might mean user is null for a split second),
    // we might want to wait. But for now, if no user in Redux, redirect.
    // NOTE: AuthInitializer runs fast, but there IS a race condition potential.
    // Ideally we check a "authLoaded" flag. 
    // Given the user wants "work as before", and before it read localStorage directly on mount.
    // AuthInitializer reads localStorage on mount.
    // So by the time this effect runs, ideally Redux is populated or about to be.
    // We add a tiny delay or just check. 

    // Actually, to simulate "reading from localstorage", we rely on the Redux state 
    // which IS effectively the memory cache of localstorage now.

    // We can't strictly block rendering if AuthInitializer hasn't finished.
    // BUT, checking localStorage directly here was sync. Redux update is async-ish.

    // Let's rely on the fact that if they are NOT logged in, Redux is null.
    // If they ARE logged in, AuthInitializer sets it.

    // To be safe and "instant": we check the state.
    if (!isAuthenticated && !localStorage.getItem("userId")) {
      // Fallback check to localStorage to prevent accidental redirect during hydration
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

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
    const currentDirectDist = localStorage.getItem("currentRestaurantDistance");
    const currentDirectName = localStorage.getItem("currentRestaurantName");

    let distToUse = null;

    // 1. Try to use the clicked distance IF it matches the cart restaurant
    if (currentDirectDist && currentDirectName && cartRestName) {
      if (currentDirectName.toLowerCase().trim() === cartRestName.toLowerCase().trim()) {
        distToUse = parseFloat(currentDirectDist);
      }
    }

    // 2. If not matched above, look up in allRestaurantDistances
    if (distToUse === null && savedDistances && cartRestName) {
      const distanceData = JSON.parse(savedDistances);
      const matchingKey = Object.keys(distanceData).find(
        key => key.toLowerCase().trim() === cartRestName.toLowerCase().trim()
      );
      if (matchingKey) {
        distToUse = parseFloat(distanceData[matchingKey]);
      }
    }

    // 3. Apply the distance or default
    if (distToUse !== null) {
      setDistance(distToUse);

      if (distToUse <= 3) {
        setDeliveryCharge(25);
      } else {
        const extraKm = Math.ceil(distToUse - 3);
        setDeliveryCharge(25 + (extraKm * 5));
      }
    } else {
      setDistance(0);
      setDeliveryCharge(25);
    }

    // ✅ Load User Details into State
    setUserName(localStorage.getItem("userName") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
    setUserPhone(localStorage.getItem("userPhone") || "");
  }, []);

  // ✅ Check for active orders
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    const checkActiveOrders = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await fetch(`/api/check-user-active-order?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setHasActiveOrder(data.hasActiveOrder);
        }
      } catch (err) {
        console.error("Error checking active orders:", err);
      }
    };
    checkActiveOrders();
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
    window.dispatchEvent(new Event("cartUpdated")); // Notify Navbar
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated")); // Notify Navbar
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

      // Look up dbName
      const currentRestName = cartItems[0]?.restaurantName;
      const currentRest = restList.find(r => r.name === currentRestName);
      const dbName = currentRest ? currentRest.dbname : "";

      const orderPayload = {
        userId: localStorage.getItem('userId'),
        items: cartItems.map(item => ({
          itemId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(quantities[item.id] || 1)
        })),
        restaurantId: String(cartItems[0].restid || cartItems[0].restaurantName),
        restaurantName: dbName,
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
              router.push("/finalorderstatuses");
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
    <div className="cart-container">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="cart-header">
        <div>
          <i className="fas fa-chevron-left me-2" onClick={() => router.back()} style={{ cursor: 'pointer', fontSize: '1.2rem' }}></i>
          <span className="restaurant-name">{cartItems[0]?.restaurantName || "Restaurant"}</span>
        </div>
        {/* Date placeholder or dynamic if needed, keeping simple for now to match layout */}
        <span className="cart-date">{new Date().toLocaleDateString('en-GB')}</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted h5">No items in the cart.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary mt-3 btn-sm">Browse Restaurants</button>
        </div>
      ) : (
        <>
          {/* Items Card */}
          <div className="beige-card">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item-row">
                <span className="item-name">{item.name}</span>
                <div className="d-flex align-items-center">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn">+</button>
                    <span className="qty-val">{quantities[item.id]}</span>
                    <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn">-</button>
                  </div>
                  <span className="item-price">₹{item.price} x {quantities[item.id]}</span>
                  <button onClick={() => removeItem(item.id)} className="trash-btn">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Card */}
          <div className="beige-card">
            <div className="totals-row">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(0)}</span>
            </div>
            <div className="totals-row">
              <span>GST</span>
              <span>₹{gstAmount.toFixed(0)}</span>
            </div>
            <div className="totals-row">
              <span>Delivery charges ({distance} km)</span>
              <span>₹{deliveryCharge}</span>
            </div>
            <div className="totals-divider"></div>
            <div className="grand-total-row">
              <span>Grand total</span>
              <span>₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-container">
            <button onClick={clear} className="beige-btn-outline">Clear all</button>
            <button
              onClick={() => {
                if (hasActiveOrder) {
                  showToast("Order already exists. Please finish it first.", "danger");
                  return;
                }
                setShowAddressBox(true);
              }}
              className="beige-btn-filled"
              disabled={showAddressBox || hasActiveOrder}
              title={hasActiveOrder ? "You have an active order" : "Place order"}
              style={hasActiveOrder ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {hasActiveOrder ? "Order in Progress" : "Place the order"}
            </button>
          </div>

          {/* Address Section */}
          {showAddressBox && (
            <div className="mt-4">
              <label className="address-label">Delivery address</label>

              <input
                type="text"
                className="address-input"
                placeholder="Flat no / house no"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
              />
              <input
                type="text"
                className="address-input"
                placeholder="Street / Area / Colony"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <input
                type="text"
                className="address-input"
                placeholder="Land Mark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />

              <button
                onClick={placeOrder}
                className="confirm-btn"
                disabled={loading || hasActiveOrder}
                title={hasActiveOrder ? "Cannot proceed with active order" : "Confirm Order"}
                style={hasActiveOrder ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {hasActiveOrder
                  ? "Order already in progress"
                  : (loading ? <Loading /> : `Confirm order and pay ₹${grandTotal.toFixed(0)}`)
                }
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
