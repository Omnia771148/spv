'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import Loading from '../loading/page';
import './MyReviews.css';
import { useRouter } from 'next/navigation';

export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            router.replace("/login");
            return;
        }
        fetchMyReviews(userId);
    }, []);

    const fetchMyReviews = async (userId) => {
        try {
            const res = await axios.get(`/api/my-reviews?userId=${userId}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Failed to load reviews.");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) return <Loading />;

    return (
        <div className="my-reviews-container">
            <div className="reviews-header">
                <button className="back-button-svg" onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="reviews-header-pill">
                    <span className="header-icon">⭐</span>
                    <h2>My Reviews</h2>
                </div>
            </div>

            {error && <div className="error-message text-center">{error}</div>}

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <div className="no-reviews">
                        <p>You haven't submitted any reviews yet.</p>
                        <button onClick={() => router.push('/finalorders')} className="btn btn-sm btn-dark">
                            Go to Orders
                        </button>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="review-card">
                            <div className="review-card-header">
                                <div className="order-info">
                                    <h3>Order #{review.orderId}</h3>
                                    <div className="review-date">{formatDate(review.createdAt)}</div>
                                </div>
                            </div>

                            <div className="review-content">
                                {/* Restaurant Review */}
                                <div className="review-item">
                                    <span className="review-label">Restaurant Experience</span>
                                    <div className="stars">{renderStars(review.restaurantRating)}</div>
                                    {review.restaurantReview && (
                                        <div className="review-text">"{review.restaurantReview}"</div>
                                    )}
                                </div>

                                {/* Delivery Review */}
                                {review.deliveryBoyRating && (
                                    <div className="review-item">
                                        <span className="review-label">Delivery Experience</span>
                                        <div className="stars">{renderStars(review.deliveryBoyRating)}</div>
                                        {review.deliveryBoyReview && (
                                            <div className="review-text">"{review.deliveryBoyReview}"</div>
                                        )}
                                    </div>
                                )}

                                {/* Ordered Items Summary - Now supported! */}
                                {review.items && review.items.length > 0 && (
                                    <div className="ordered-items-summary">
                                        <div className="ordered-items-title">Items in this order:</div>
                                        <div className="item-chip-container">
                                            {review.items.map((item, idx) => (
                                                <div key={idx} className="item-chip">
                                                    {item.quantity} x {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
