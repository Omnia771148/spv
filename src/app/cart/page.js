'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import Script from 'next/script';
import Loading from '../loading/page';
import { showToast } from '../../toaster/page';
import './cart.css';

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
  const [addressLabel, setAddressLabel] = useState("Home"); // Default label
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
  const [savedAddresses, setSavedAddresses] = useState([]);

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

  // ✅ Load Saved Addresses from DB on Mount
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await fetch(`/api/users/address?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.addresses) {
            setSavedAddresses(data.addresses);
          }
        }
      } catch (error) {
        console.error("Error fetching saved addresses:", error);
      }
    };
    fetchSavedAddresses();
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

  const handleSaveAddress = async () => {
    if (!flatNo.trim() || !street.trim()) {
      showToast("Please enter Flat No and Street before saving.", "danger");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      showToast("Please login to save address", "danger");
      return;
    }

    const latStr = localStorage.getItem("customerLat");
    const lngStr = localStorage.getItem("customerLng");
    const lat = latStr ? parseFloat(latStr) : null;
    const lng = lngStr ? parseFloat(lngStr) : null;

    const mapUrl = (lat && lng)
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : "";

    const addressData = {
      label: addressLabel,
      flatNo,
      street,
      landmark,
      lat,
      lng,
      url: mapUrl
    };

    try {
      const res = await axios.post('/api/users/address', {
        userId,
        address: addressData
      });

      if (res.data.success) {
        setSavedAddresses(res.data.addresses);
        showToast("Address saved to your profile!", "success");
      } else {
        showToast("Failed to save address", "danger");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("Error saving address", "danger");
    }
  };

  const loadSavedAddress = (addr) => {
    if (addr) {
      setFlatNo(addr.flatNo || "");
      setStreet(addr.street || "");
      setLandmark(addr.landmark || "");
      setAddressLabel(addr.label || "Home");

      if (addr.lat && addr.lng) {
        localStorage.setItem("customerLat", addr.lat);
        localStorage.setItem("customerLng", addr.lng);
      }

      showToast(`Address (${addr.label}) loaded!`, "success");
    }
  };

  const handleDeleteAddress = async (e, addrId) => {
    e.stopPropagation(); // Prevent loading the address when clicking delete
    const userId = localStorage.getItem("userId");
    if (!userId || addrId === 'legacy') return;

    try {
      const res = await axios.delete(`/api/users/address?userId=${userId}&addressId=${addrId}`);
      if (res.data.success) {
        setSavedAddresses(res.data.addresses);
        showToast("Address removed", "success");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to remove address", "danger");
    }
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

      // Determine the correct numeric restaurantId based on Item ID ranges
      // We check the ID range for ALL orders to ensure we always get the correct numeric ID (1-7)
      let restaurantId = String(cartItems[0].restid || "");
      const firstItemId = Number(cartItems[0].id || 0);

      // Always try to map based on ID first, as this is the most reliable source
      if (firstItemId >= 1 && firstItemId <= 100) restaurantId = "1";
      else if (firstItemId >= 101 && firstItemId <= 205) restaurantId = "2";
      else if (firstItemId >= 206 && firstItemId <= 310) restaurantId = "3";
      else if (firstItemId >= 311 && firstItemId <= 411) restaurantId = "4";
      else if (firstItemId >= 412 && firstItemId <= 512) restaurantId = "5";
      else if (firstItemId >= 513 && firstItemId <= 613) restaurantId = "6";
      else if (firstItemId >= 614 && firstItemId <= 714) restaurantId = "7";

      // Fallback: If no ID range matched (unlikely for valid items), keep the original value
      if (!restaurantId || restaurantId === "undefined") {
        restaurantId = String(cartItems[0].restid || cartItems[0].restaurantName);
      }

      const orderPayload = {
        userId: localStorage.getItem('userId'),
        items: cartItems.map(item => ({
          itemId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(quantities[item.id] || 1)
        })),
        restaurantId: restaurantId,
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
        restaurantName: cartItems[0]?.restaurantName || "",
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
              showToast('Order Placed Successfully!', 'success');

              // ✅ Automatically save address to user's profile on success
              try {
                const currentLat = localStorage.getItem("customerLat");
                const currentLng = localStorage.getItem("customerLng");
                const currentUserId = localStorage.getItem("userId");

                if (currentUserId && flatNo && street) {
                  await axios.post('/api/users/address', {
                    userId: currentUserId,
                    address: {
                      label: addressLabel || "Recent Order",
                      flatNo: flatNo.trim(),
                      street: street.trim(),
                      landmark: landmark ? landmark.trim() : "",
                      lat: currentLat ? parseFloat(currentLat) : null,
                      lng: currentLng ? parseFloat(currentLng) : null,
                      url: (currentLat && currentLng) ? `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}` : ""
                    }
                  });
                }
              } catch (addrErr) {
                console.error("Silent error saving address on order:", addrErr);
              }

              clear();
              router.push("/finalorderstatuses");
            } else {
              setLoading(false);
              showToast(`Order verification failed: ${verifyRes.data.message}`, 'danger');
            }
          } catch (verifyErr) {
            setLoading(false);
            showToast(`Payment verification error: ${verifyErr.response?.data?.error || verifyErr.message}`, 'danger');
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
          <span className="restaurant-name">{cartItems.length > 0 ? cartItems[0]?.restaurantName : ""}</span>
        </div>
        {/* Date line removed as per user edit */}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-orders-container">
          <div className="empty-orders-icon-wrapper">
            <i className="fas fa-utensils empty-orders-icon"></i>
          </div>
          <h3 className="empty-orders-title">No items in the cart</h3>
          <p className="empty-orders-subtitle">Your cart is quiet right now. Let&apos;s fix that with some delicious food!</p>
          <button onClick={() => router.push('/')} className="browse-btn-orders">
            Order Something Tasty
          </button>
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

              <div className="address-label-selector mb-3">
                <span style={{ fontSize: '0.9rem', marginRight: '10px', color: '#666' }}>Save as:</span>
                {['Home', 'Office', 'Apartment', 'Other'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setAddressLabel(l)}
                    className={`label-btn ${addressLabel === l ? 'active' : ''}`}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: '1px solid #ccc',
                      marginRight: '8px',
                      fontSize: '0.85rem',
                      background: addressLabel === l ? '#1a1a1a' : 'transparent',
                      color: addressLabel === l ? '#fff' : '#1a1a1a',
                      transition: 'all 0.2s'
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button
                  onClick={handleSaveAddress}
                  className="beige-btn-outline"
                  style={{ borderRadius: '15px', padding: '8px 15px', fontSize: '0.9rem' }}
                >
                  Save Address
                </button>
              </div>

              {savedAddresses && savedAddresses.length > 0 && (
                <div className="saved-addresses-list mt-3">
                  <label className="address-label" style={{ fontSize: '0.9rem', color: '#666' }}>Use a saved address:</label>
                  <div className="d-flex flex-wrap gap-2">
                    {savedAddresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => loadSavedAddress(addr)}
                        className="beige-card saved-address-card"
                        style={{
                          cursor: 'pointer',
                          border: '1px solid #ddd',
                          padding: '10px',
                          borderRadius: '12px',
                          flex: '1 1 150px',
                          maxWidth: '250px',
                          fontSize: '0.85rem',
                          position: 'relative'
                        }}
                      >
                        {addr._id !== 'legacy' && (
                          <div
                            onClick={(e) => handleDeleteAddress(e, addr._id)}
                            style={{ position: 'absolute', top: '5px', right: '8px', color: '#888', padding: '5px' }}
                          >
                            <i className="fas fa-times"></i>
                          </div>
                        )}
                        <div style={{ fontWeight: 'bold', marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                          <i className={`fas ${addr.label === 'Home' ? 'fa-home' : addr.label === 'Office' ? 'fa-building' : addr.label === 'Apartment' ? 'fa-city' : 'fa-map-marker-alt'}`} style={{ marginRight: '8px', color: '#1a1a1a' }}></i>
                          {addr.label}
                        </div>
                        <div style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                          {addr.flatNo}, {addr.street}{addr.landmark ? `, ${addr.landmark}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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