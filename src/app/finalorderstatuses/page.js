"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from '../loading/page';
import './orderstatus.css';

import { restList } from '../restorentList/restorentDtata';

export default function FinalOrderStatuses() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      router.push("/login");
      return;
    }

    const fetchOrders = () => {
      fetch(`/api/finalorderstatuses?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    // Initial fetch
    fetchOrders();

    // Poll every 2 minutes (120,000 ms)
    const intervalId = setInterval(fetchOrders, 10000);

    return () => clearInterval(intervalId);
  }, [router]);

  useEffect(() => {
    // Check for rejected orders and set up auto-deletion
    const timers = [];
    orders.forEach((order) => {
      if (order.status?.toLowerCase().includes('rejected')) {
        const timer = setTimeout(() => {
          deleteOrder(order._id);
        }, 60000); // 1 minute
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [orders]);

  const deleteOrder = async (orderId) => {
    try {
      await fetch(`/api/finalorderstatuses/${orderId}`, {
        method: 'DELETE',
      });
      // Remove from UI immediately
      setOrders((prevOrders) => prevOrders.filter((o) => o._id !== orderId));
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const getStatusProgress = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('rejected')) return { width: '100%', text: 'Rejected by restaurant', color: '#DC3545' };
    if (s.includes('pending') || s.includes('preparing')) return { width: '25%', text: 'Your food is being prepared', color: '#2E7D32' };
    if (s.includes('waiting') || s.includes('driver')) return { width: '50%', text: 'Waiting for delivery partner', color: '#2E7D32' };
    if (s.includes('out') || s.includes('soon')) return { width: '80%', text: 'Out for delivery', color: '#2E7D32' };
    if (s.includes('delivered')) return { width: '100%', text: 'Delivered', color: '#2E7D32' };
    return { width: '10%', text: 'Processing', color: '#ff0000' };
  };

  const getOtp = (razorpayOrderId) => {
    if (!razorpayOrderId) return '****';
    return razorpayOrderId.slice(-5);
  };

  const getRestaurantName = (id) => {
    const restaurant = restList.find((r) => r.id === String(id));
    if (restaurant) {
      // Capitalize first letter of each word if needed (e.g. "bros" -> "Bros")
      return restaurant.name.replace(/\b\w/g, l => l.toUpperCase());
    }
    return id || "Ordered Item";
  };

  if (loading) return <Loading />;

  return (
    <div className="order-wrapper">
      {/* Header Badge - Only show if there are orders */}
      {orders.length > 0 && (
        <div className="live-badge">
          <div className="live-dot-outer">
            <div className="live-dot-inner"></div>
          </div>
          Clear the table! Greatness is on its way... 🍽️
        </div>
      )}

      {orders.length === 0 && (
        <div className="empty-orders-container">
          <div className="empty-orders-icon-wrapper">
            <i className="fas fa-utensils empty-orders-icon"></i>
          </div>
          <h3 className="empty-orders-title">No Active Orders</h3>
          <p className="empty-orders-subtitle">Your kitchen is quiet right now. Let&apos;s fix that with some delicious food!</p>
          <button onClick={() => router.push('/')} className="browse-btn-orders">
            Order Something Tasty
          </button>
        </div>
      )}

      {orders.map((order) => {
        const { width, text, color } = getStatusProgress(order.status);

        return (
          <div className="order-card" key={order._id}>
            {/* Header: RestaurantName + Date */}
            <div className="card-header-row">
              <h2 className="restaurant-title">{getRestaurantName(order.restaurantId)}</h2>

            </div>

            {/* Order Details */}
            <div className="details-section">
              <div className="section-label">Order details</div>
              <div className="order-id-text" style={{ alignSelf: 'flex-start' }}>Order ID - {order.orderId}</div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-icon" style={{ left: width }}>
                  {/* Using a simple bowl icon or similar from fontawesome */}
                  <i className="fa-solid fa-bowl-food" style={{ color: '#888' }}></i>
                </div>
                <div className="progress-pointer" style={{ left: width, borderTopColor: color }}></div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: width, backgroundColor: color }}></div>
                  <div className="status-caption" style={{ zIndex: 5, color: '#999', mixBlendMode: 'multiply' }}>{text}</div>
                </div>
                {/* Alternatively put text below if it clashes */}
                {/* <div className="status-caption-below">{text}</div> */}
              </div>
            </div>

            {/* Hunger Savior Details */}
            <div className="details-section">
              <div className="section-label">Your Hunger Savior details</div>
              <div className="savior-card">
                <div className="savior-row">
                  <span className="savior-label">Name</span>
                  <span className="savior-value">{order.deliveryBoyName || "Not Assigned"}</span>
                </div>
                {order.deliveryBoyPhone ? (
                  <div className="savior-row">
                    <a href={`tel:${order.deliveryBoyPhone}`} className="call-btn">
                      <i className="fa-solid fa-phone"></i> Call Savior
                    </a>
                  </div>
                ) : (
                  <div className="savior-row">
                    <span className="savior-label">Phone</span>
                    <span className="savior-value">Pending</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bill-container">
              {/* Items Table */}
              <table className="bill-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingBottom: '10px' }}>
                      <span className="header-pill">Items</span>
                    </th>
                    <th style={{ textAlign: 'center', paddingBottom: '10px' }}>
                      <span className="header-pill">Quantity</span>
                    </th>
                    <th style={{ textAlign: 'right', paddingBottom: '10px' }}>
                      <span className="header-pill">Cost</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="item-name">{item.name}</td>
                      <td className="item-qty">{item.quantity}x</td>
                      <td className="item-price">₹ {item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="divider-line"></div>

              <div className="subtotal-row">
                <span>Sub Total</span>
                <span>₹ {order.totalPrice}</span>
              </div>
              <div className="delivery-row">
                <span>Delivery Charges</span>
                <span>₹ {order.deliveryCharge || 0}</span>
              </div>
              {order.gst > 0 && (
                <div className="gst-row">
                  <span>GST</span>
                  <span style={{ marginRight: 'auto', marginLeft: '10px' }}>5%</span>
                  <span>₹ {order.gst}</span>
                </div>
              )}

              <div className="divider-line"></div>
              <div className="total-row">
                <span style={{ marginRight: 'auto', marginLeft: '0px' }}>Total</span>
                <span>₹ {order.grandTotal}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="payment-info">
              <div className="payment-row">
                <span className="payment-label">Payment status</span>
                <span className="payment-value">
                  <span className="payment-status-badge">{order.paymentStatus}</span>
                </span>
              </div>
              <div className="payment-row">
                <span className="payment-label">Payment ID</span>
                <span className="payment-value">{order.razorpayPaymentId}</span>
              </div>
            </div>

            {/* OTP Section */}
            <div className="otp-container">

              <div className="otp-pill">
                OTP - {getOtp(order.razorpayOrderId)}
              </div>
            </div>

          </div>
        );
      })}
      <br></br>
      <br></br>
      <br></br>
    </div>

  );
}
