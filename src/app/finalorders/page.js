'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import Loading from '../loading/page';
import './MyOrders.css';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");
    const router = useRouter();

    useEffect(() => {
        const loggedInUserId = localStorage.getItem("userId");

        if (!loggedInUserId) {
            setError("No user logged in. Please login first.");
            setLoading(false);
            return;
        }

        setUserId(loggedInUserId);
        fetchMyOrders(loggedInUserId);
    }, []);

    const fetchMyOrders = async (userId) => {
        try {
            const res = await axios.get(`/api/final-orders?userId=${userId}`);
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return '#4caf50'; // Green
            case 'pending': return '#ff9800';   // Orange
            case 'cancelled': return '#f44336'; // Red
            case 'processing': return '#2196f3';// Blue
            default: return '#9e9e9e';          // Grey
        }
    };

    // Helper to format date cleanly
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handlePrintInvoice = (orderId) => {
        // Open invoice in new window and print
        const printWindow = window.open(`/invoice/${orderId}`, '_blank');
        if (printWindow) {
            printWindow.onload = function () {
                printWindow.print();
            }
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="my-orders-container">
            {/* Header */}
            <div className="orders-header">
                <button className="back-button-svg" onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="orders-header-pill">
                    <span className="header-icon">📦</span>
                    <h2>My Orders</h2>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>No orders found for your account.</p>
                    <button onClick={() => fetchMyOrders(userId)} className="refresh-btn">
                        Refresh Orders
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-id-section">
                                    <h3>Order #{order.orderId}</h3>
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <p className="order-date">
                                    {formatDate(order.orderDate)}
                                </p>
                            </div>

                            <div className="order-details">
                                {/* Items Section */}
                                <div className="order-section">
                                    <h4>Items Ordered</h4>
                                    <div className="items-list">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="item-row">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-quantity">x {item.quantity}</span>
                                                <span className="item-price">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing Section */}
                                <div className="order-section">
                                    <h4>Payment Details</h4>
                                    <div className="pricing-details">
                                        <div className="price-row">
                                            <span>Subtotal</span>
                                            <span>₹{order.totalPrice}</span>
                                        </div>
                                        {order.gst > 0 && (
                                            <div className="price-row">
                                                <span>GST</span>
                                                <span>₹{order.gst}</span>
                                            </div>
                                        )}
                                        <div className="price-row">
                                            <span>Delivery</span>
                                            <span>₹{order.deliveryCharge || 0}</span>
                                        </div>
                                        <div className="price-row total">
                                            <strong>Total</strong>
                                            <strong>₹{order.grandTotal}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="order-section">
                                    <div className="payment-info">
                                        <p style={{ margin: 0 }}>
                                            <strong>Payment:</strong> {order.paymentStatus}
                                            {order.razorpayPaymentId && (
                                                <span style={{ display: 'block', fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                                    TxN: {order.razorpayPaymentId}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Address */}
                                {order.location?.address && (
                                    <div className="order-section">
                                        <div className="delivery-address">
                                            <strong>Delivering to:</strong> {order.location.address}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="order-footer">
                                <div className="footer-left">
                                    {/* Timestamp logic if needed, e.g. Accepted At */}
                                    {(order.completedAt || order.acceptedAt) && (
                                        <span>Updated: {formatDate(order.completedAt || order.acceptedAt)}</span>
                                    )}
                                </div>

                                <div className="footer-right">
                                    
                                    <Link
                                        href={`/invoice/${order._id}`}
                                        className="invoice-btn"
                                        target="_blank"
                                    >
                                        📄 Invoice
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}