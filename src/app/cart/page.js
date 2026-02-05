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
import ErrorPopup from '../login/ErrorPopup';

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

  // Custom Popup State
  const [popup, setPopup] = useState({ show: false, message: '', isSuccess: false, onConfirm: null });

  const aa = "gg";

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ... (useEffect hooks remain same until placeOrder)

  // REDUX AUTH CHECK
  useEffect(() => {
    // ... (existing logic)
    if (!isAuthenticated && !localStorage.getItem("userId")) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // ... (existing logic for loading cart and user details)
    const savedCart = localStorage.getItem('cart');
    let cartRestName = "";
    // ... (rest of cart loading logic)
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      if (parsedCart.length > 0) {
        cartRestName = parsedCart[0].restaurantName || parsedCart[0].restName || "";
      }
      const initialQuantities = {};
      parsedCart.forEach(item => { initialQuantities[item.id] = item.quantity || 1; });
      setQuantities(initialQuantities);
    }

    const savedDistances = localStorage.getItem("allRestaurantDistances");
    const currentDirectDist = localStorage.getItem("currentRestaurantDistance");
    const currentDirectName = localStorage.getItem("currentRestaurantName");
    let distToUse = null;

    if (currentDirectDist && currentDirectName && cartRestName) {
      if (currentDirectName.toLowerCase().trim() === cartRestName.toLowerCase().trim()) {
        distToUse = parseFloat(currentDirectDist);
      }
    }
    if (distToUse === null && savedDistances && cartRestName) {
      const distanceData = JSON.parse(savedDistances);
      const matchingKey = Object.keys(distanceData).find(key => key.toLowerCase().trim() === cartRestName.toLowerCase().trim());
      if (matchingKey) distToUse = parseFloat(distanceData[matchingKey]);
    }

    if (distToUse !== null) {
      setDistance(distToUse);
      if (distToUse <= 3) setDeliveryCharge(25);
      else setDeliveryCharge(25 + (Math.ceil(distToUse - 3) * 5));
    } else {
      setDistance(0);
      setDeliveryCharge(25);
    }

    setUserName(localStorage.getItem("userName") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
    setUserPhone(localStorage.getItem("userPhone") || "");
  }, []);

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
      } catch (err) { console.error(err); }
    };
    checkActiveOrders();
  }, []);

  useEffect(() => {
    const totals = {};
    cartItems.forEach(item => { totals[item.id] = item.price * (quantities[item.id] || 1); });
    setItemTotals(totals);
  }, [cartItems, quantities]);

  const totalPrice = Object.values(itemTotals).reduce((acc, val) => acc + val, 0);
  const gstAmount = totalPrice * 0.05;
  const grandTotal = totalPrice + gstAmount + deliveryCharge;

  /* Clear All with Feedback */
  const clear = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    setItemTotals({});
    setQuantities({});
    setShowAddressBox(false);
    setFlatNo("");
    setStreet("");
    setLandmark("");
    window.dispatchEvent(new Event("cartUpdated"));
    showToast("Cart cleared successfully! 🗑️", "danger");
  };

  /* Remove Single Item with Feedback */
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    showToast("Removed from cart 🗑️", "danger");
  };

  const updateQuantity = (id, delta) => {
    setQuantities(prev => {
      const newQty = (prev[id] || 1) + delta;
      const finalQty = newQty > 0 ? newQty : 1;
      const updatedCart = cartItems.map(item => item.id === id ? { ...item, quantity: finalQty } : item);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event("cartUpdated"));
      return { ...prev, [id]: finalQty };
    });
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return setPopup({ show: true, message: "Cart is empty", isSuccess: false });
    const deliveryAddress = `${flatNo}, ${street} ${landmark ? ', ' + landmark : ''}`;
    if (!flatNo.trim() || !street.trim()) return setPopup({ show: true, message: "Please enter Flat No and Street address.", isSuccess: false });

    setLoading(true);

    try {
      const latStr = localStorage.getItem("customerLat");
      const lngStr = localStorage.getItem("customerLng");

      const dynamicMapUrl = latStr && lngStr ? `https://www.google.com/maps/search/?api=1&query=${latStr},${lngStr}` : "";
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

      const { data } = await axios.post('/api/create-order', { grandTotal: orderPayload.grandTotal });
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
              setPopup({
                show: true,
                message: 'Order Placed Successfully! 🎉',
                isSuccess: true,
                onConfirm: () => {
                  clear();
                  router.push("/finalorderstatuses");
                }
              });
            } else {
              setLoading(false);
              setPopup({ show: true, message: `Order verification failed: ${verifyRes.data.message}`, isSuccess: false });
            }
          } catch (verifyErr) {
            setLoading(false);
            setPopup({ show: true, message: `Payment verification error: ${verifyErr.response?.data?.error || verifyErr.message}`, isSuccess: false });
          }
        },
        prefill: { name: userName, email: userEmail, contact: userPhone || "9999999999" },
        theme: { color: "#3399cc" },
        modal: { ondismiss: function () { setLoading(false); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setLoading(false);
      setPopup({ show: true, message: `Error: ${err.message}`, isSuccess: false });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="cart-container">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Custom Popup */}
      {popup.show && (
        <ErrorPopup
          message={popup.message}
          isSuccess={popup.isSuccess}
          onClose={() => {
            if (popup.onConfirm) {
              popup.onConfirm();
            }
            setPopup({ ...popup, show: false, onConfirm: null });
          }}
        />
      )}

      {/* ... Rest of JSX ... */}
      <div className="cart-header">
        <div><span className="restaurant-name">{cartItems[0]?.restaurantName || "Restaurant"}</span></div>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <div className="empty-cart-icon-wrapper"><i className="fas fa-shopping-basket empty-cart-icon"></i></div>
          <h3 className="empty-cart-title">Your Cart is Empty</h3>
          <p className="empty-cart-subtitle">Looks like you haven&apos;t added any food yet. Hunger is a bad emotion!</p>
          <button onClick={() => router.push('/')} className="browse-btn">Browse Restaurants</button>
        </div>
      ) : (
        <>
          <div className="beige-card">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item-row">
                <span className="item-name">{item.name}</span>
                <div className="d-flex align-items-center">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn">-</button>
                    <span className="qty-val">{quantities[item.id]}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn">+</button>
                  </div>
                  <span className="item-price">₹{item.price} </span>
                  <button onClick={() => removeItem(item.id)} className="trash-btn">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="beige-card">
            {/* Totals logic */}
            <div className="totals-row"><span>Total</span><span>₹{totalPrice.toFixed(0)}</span></div>
            <div className="totals-row"><span>GST</span><span>₹{gstAmount.toFixed(0)}</span></div>
            <div className="totals-row"><span>Delivery charges ({distance} km)</span><span>₹{deliveryCharge}</span></div>
            <div className="totals-divider"></div>
            <div className="grand-total-row"><span>Grand total</span><span>₹{grandTotal.toFixed(0)}</span></div>
          </div>

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
              style={hasActiveOrder ? { cursor: 'not-allowed', backgroundColor: '#dc3545', color: '#fff' } : {}}
            >
              {hasActiveOrder ? "Order in Progress" : "Place the order"}
            </button>
          </div>

          {showAddressBox && (
            <div className="mt-4">
              <label className="address-label">Delivery address</label>
              <input type="text" className="address-input" placeholder="Flat no / house no" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} />
              <input type="text" className="address-input" placeholder="Street / Area / Colony" value={street} onChange={(e) => setStreet(e.target.value)} />
              <input type="text" className="address-input" placeholder="Land Mark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
              <button
                onClick={placeOrder}
                className="confirm-btn"
                disabled={loading || hasActiveOrder}
                title={hasActiveOrder ? "Cannot proceed with active order" : "Confirm Order"}
                style={hasActiveOrder ? { cursor: 'not-allowed', backgroundColor: '#dc3545', color: '#fff' } : {}}
              >
                {hasActiveOrder ? "Order already in progress" : (loading ? <Loading /> : `Confirm order and pay ₹${grandTotal.toFixed(0)}`)}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
