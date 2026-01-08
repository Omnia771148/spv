import mongoose from "mongoose";

const FinalOrderSchema = new mongoose.Schema({
    originalOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    originalAcceptedOrderId: { type: String },
    orderId: { type: String, required: true },
    deliveryBoyId: { type: String },
    userId: { type: String, required: true }, 
    restaurantId: { type: String },
    items: [
        {
            name: { type: String },
            quantity: { type: Number },
            price: { type: Number }
        }
    ],
    totalCount: { type: Number },
    totalPrice: { type: Number },
    gst: { type: Number },
    deliveryCharge: { type: Number },
    grandTotal: { type: Number },
    paymentStatus: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },
    location: {
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

// CRITICAL CHANGE: The 3rd parameter 'finalcompletedorders' matches your Atlas screenshot.
const FinalOrder = mongoose.models.FinalOrder || 
                   mongoose.model("FinalOrder", FinalOrderSchema, "finalcompletedorders");

export default FinalOrder;