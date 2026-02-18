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
    const [reviewedOrderIds, setReviewedOrderIds] = useState([]);
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
        fetchReviewedOrders(loggedInUserId);
    }, []);

    const fetchReviewedOrders = async (uid) => {
        try {
            const res = await axios.get(`/api/my-reviews?userId=${uid}`);
            setReviewedOrderIds(res.data || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    };

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
            </div >

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )
            }

            {
                orders.length === 0 ? (
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

                                {/* Rating Section */}
                                {!reviewedOrderIds.includes(order.orderId) ? (
                                    <ReviewForm
                                        order={order}
                                        userId={userId}
                                        onReviewSubmitted={(orderId) => setReviewedOrderIds(prev => [...prev, orderId])}
                                    />
                                ) : (
                                    <div className="review-completed-msg" style={{ padding: '10px 15px', color: '#4caf50', fontWeight: 'bold' }}>
                                        <i className="fas fa-check-circle"></i> Review Submitted
                                    </div>
                                )}

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
                )
            }
        </div >
    );
}

function ReviewForm({ order, userId, onReviewSubmitted }) {
    const [restRating, setRestRating] = useState(0);
    const [restReview, setRestReview] = useState("");
    const [boyRating, setBoyRating] = useState(0);
    const [boyReview, setBoyReview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");

    const hasDeliveryBoy = !!order.deliveryBoyId;

    const handleSubmit = async () => {
        if (restRating === 0 || (hasDeliveryBoy && boyRating === 0)) {
            setMsg("Please provide star ratings.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                orderId: order.orderId,
                userId: userId,
                restaurantId: order.restaurantId,
                restaurantRating: restRating,
                restaurantReview: restReview,
            };

            if (hasDeliveryBoy) {
                payload.deliveryBoyId = order.deliveryBoyId;
                payload.deliveryBoyRating = boyRating;
                payload.deliveryBoyReview = boyReview;
            }

            await axios.post('/api/submit-review', payload);
            onReviewSubmitted(order.orderId);
            setMsg("Thanks for your feedback!");
        } catch (error) {
            console.error(error);
            setMsg("Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ rating, setRating, label }) => (
        <div className="star-rating-group" style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{label}</div>
            <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => setRating(star)}
                        style={{
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: star <= rating ? '#FFD700' : '#ddd'
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <div className="review-section" style={{ padding: '15px', borderTop: '1px solid #eee', marginTop: '10px' }}>
            <h5 style={{ fontSize: '16px', marginBottom: '15px' }}>Rate Your Experience</h5>

            <div className="review-grid" style={{ display: 'grid', gridTemplateColumns: hasDeliveryBoy ? '1fr 1fr' : '1fr', gap: '20px' }}>
                {/* Restaurant Review */}
                <div className="review-column">
                    <StarRating rating={restRating} setRating={setRestRating} label={`Restaurant: ${order.restaurantName || 'Restaurant'}`} />
                    <textarea
                        className="form-control"
                        placeholder="How was the food?"
                        value={restReview}
                        onChange={(e) => setRestReview(e.target.value)}
                        style={{ fontSize: '13px', height: '60px' }}
                    />
                </div>

                {/* Delivery Boy Review - Conditional */}
                {hasDeliveryBoy && (
                    <div className="review-column">
                        <StarRating rating={boyRating} setRating={setBoyRating} label="Delivery Partner" />
                        <textarea
                            className="form-control"
                            placeholder="How was the delivery?"
                            value={boyReview}
                            onChange={(e) => setBoyReview(e.target.value)}
                            style={{ fontSize: '13px', height: '60px' }}
                        />
                    </div>
                )}
            </div>

            {msg && <div style={{ color: msg.includes('Thanks') ? 'green' : 'red', marginTop: '10px', fontSize: '13px' }}>{msg}</div>}

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '15px', width: '100%', backgroundColor: '#ff9800', borderColor: '#ff9800' }}
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </div>
    );
}