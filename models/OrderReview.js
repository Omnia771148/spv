import mongoose from "mongoose";

const OrderReviewSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    deliveryBoyId: { type: String }, // Optional, as some orders might not have a delivery boy assigned or it's self-pickup

    restaurantRating: { type: Number, min: 1, max: 5 },
    restaurantReview: { type: String },

    deliveryBoyRating: { type: Number, min: 1, max: 5 },
    deliveryBoyReview: { type: String },

    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent multiple reviews for the same order by the same user if desired.
// For now, I'll just index orderId for faster lookups.
OrderReviewSchema.index({ orderId: 1 });
OrderReviewSchema.index({ restaurantId: 1 });
OrderReviewSchema.index({ deliveryBoyId: 1 });

const OrderReview = mongoose.models.OrderReview || mongoose.model("OrderReview", OrderReviewSchema);

export default OrderReview;
