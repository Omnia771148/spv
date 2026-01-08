'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import Loading from '../loading/page';
import './MyOrders.css';
import Link from 'next/link'; // Import Link for navigation

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        // Get the current user ID from local storage
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

    // Calculate status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'green';
            case 'pending':
                return 'orange';
            case 'cancelled':
                return 'red';
            case 'processing':
                return 'blue';
            default:
                return 'gray';
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="my-orders-container">
            <div className="orders-header">
                <h2>My Orders</h2>
                <p className="user-id">User ID: {userId}</p>
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
                        Refresh
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
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <p className="order-date">
                                    Ordered on: {new Date(order.orderDate).toLocaleDateString('en-IN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div className="order-details">
                                <div className="order-section">
                                    <h4>Items Ordered:</h4>
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

                                <div className="order-section">
                                    <h4>Pricing Details:</h4>
                                    <div className="pricing-details">
                                        <div className="price-row">
                                            <span>Subtotal:</span>
                                            <span>₹{order.totalPrice}</span>
                                        </div>
                                        <div className="price-row">
                                            <span>GST ({order.gst ? ((order.gst/order.totalPrice)*100).toFixed(1) : '0'}%):</span>
                                            <span>₹{order.gst || 0}</span>
                                        </div>
                                        <div className="price-row">
                                            <span>Delivery Charge:</span>
                                            <span>₹{order.deliveryCharge || 0}</span>
                                        </div>
                                        <div className="price-row total">
                                            <strong>Grand Total:</strong>
                                            <strong>₹{order.grandTotal}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-section">
                                    <h4>Payment Information:</h4>
                                    <div className="payment-info">
                                        <p><strong>Status:</strong> 
                                            <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </p>
                                        {order.razorpayPaymentId && (
                                            <p className="payment-id">
                                                <strong>Transaction ID:</strong> {order.razorpayPaymentId}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {order.location?.address && (
                                    <div className="order-section">
                                        <h4>Delivery Address:</h4>
                                        <p className="delivery-address">{order.location.address}</p>
                                    </div>
                                )}

                                {order.restaurantId && (
                                    <div className="order-section">
                                        <h4>Restaurant ID:</h4>
                                        <p>{order.restaurantId}</p>
                                    </div>
                                )}

                                {order.deliveryBoyId && (
                                    <div className="order-section">
                                        <h4>Delivery Agent ID:</h4>
                                        <p>{order.deliveryBoyId}</p>
                                    </div>
                                )}
                            </div>

                            <div className="order-footer">
                                <div className="footer-left">
                                    {order.acceptedAt && (
                                        <p><strong>Accepted At:</strong> {new Date(order.acceptedAt).toLocaleString()}</p>
                                    )}
                                    {order.completedAt && (
                                        <p><strong>Completed At:</strong> {new Date(order.completedAt).toLocaleString()}</p>
                                    )}
                                </div>
                                
                                {/* INVOICE BUTTON - Opens in new tab */}
                                <div className="footer-right">
                                    <Link 
                                        href={`/invoice/${order._id}`} 
                                        className="invoice-btn"
                                        target="_blank"
                                    >
                                        📄 View Invoice
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