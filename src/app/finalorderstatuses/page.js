"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import './orderstatus.css';

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

    fetch(`/api/finalorderstatuses?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
    if (s.includes('pending') || s.includes('preparing')) return { width: '25%', text: 'Your food is being prepared', color: '#6BCB77' };
    if (s.includes('waiting') || s.includes('driver')) return { width: '50%', text: 'Waiting for delivery partner', color: '#6BCB77' };
    if (s.includes('out') || s.includes('soon')) return { width: '80%', text: 'Out for delivery', color: '#6BCB77' };
    if (s.includes('delivered')) return { width: '100%', text: 'Delivered', color: '#6BCB77' };
    return { width: '10%', text: 'Processing', color: '#6BCB77' };
  };

  const getOtp = (razorpayOrderId) => {
    if (!razorpayOrderId) return '****';
    return razorpayOrderId.slice(-5);
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#F8F5EB' }}>Loading...</div>;

  return (
    <div className="order-wrapper">
      {/* Header Badge */}
      <div className="live-badge">
        <div className="live-dot-outer">
          <div className="live-dot-inner"></div>
        </div>
        Live orders
      </div>

      {orders.length === 0 && <p className="text-center mt-5">No active orders found.</p>}

      {orders.map((order) => {
        const { width, text, color } = getStatusProgress(order.status);

        return (
          <div className="order-card" key={order._id}>
            {/* Header: RestaurantName + Date */}
            <div className="card-header-row">
              <h2 className="restaurant-title">{order.restaurantId || "Kushal Kitchen"}</h2>
              <span className="order-timestamp">{new Date(order.createdAt).toLocaleString('en-GB')}</span>
            </div>

            {/* Order Details */}
            <div className="details-section">
              <div className="section-label">Order details</div>
              <div className="order-id-text">Order ID - {order.orderId}</div>

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

            {/* Delivery Boy Details - Static/Fallback if missing in data as requested */}
            <div className="details-section">
              <div className="section-label">Delivery Boy details</div>
              <div>Delivery boy name - {order.deliveryBoyName || "Not Assigned"}</div>
              <div>Delivery boy phone no - {order.deliveryBoyPhone || "Pending"}</div>
            </div>

            {/* Items Table */}
            <table className="bill-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '18px', paddingBottom: '5px' }}>Items</th>
                  <th style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', paddingBottom: '5px' }}>Quantity</th>
                  <th style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px', paddingBottom: '5px' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="item-name">{item.name}</td>
                    <td className="item-qty">{item.quantity}x</td>
                    <td className="item-price">-{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="divider-line"></div>

            <div className="subtotal-row">
              <span>Sub Total</span>
              <span>-{order.totalPrice}</span>
            </div>
            {order.gst > 0 && (
              <div className="gst-row">
                <span>GST</span>
                <span style={{ marginRight: 'auto', marginLeft: '10px' }}>5%</span>
                <span>-{order.gst}</span>
              </div>
            )}

            <div className="divider-line"></div>
            <div className="total-row">
              <span>-{order.grandTotal}</span>
            </div>

            {/* Payment Status */}
            <div className="payment-info">
              <div>
                Payment status - <i className="fa-solid fa-circle-check check-green"></i> {order.paymentStatus}
              </div>
              <div style={{ fontSize: '11px', color: '#555' }}>
                Payment ID - {order.razorpayPaymentId}
              </div>
            </div>

            {/* OTP Section */}
            <div className="otp-container">
              <span style={{ fontWeight: 'bold' }}>Total</span>
              <div className="otp-pill">
                OTP - {getOtp(order.razorpayOrderId)}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
