import mongoose from "mongoose";

const paymentFailedOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      itemId: { type: String },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
    }
  ],
  totalCount: { type: Number },
  totalPrice: { type: Number },
  gst: { type: Number },
  deliveryCharge: { type: Number },
  grandTotal: { type: Number },
  
  // ✅ UPDATED FIELDS
  orderId: { type: String }, // Stores Custom ID: "ORD-001001"
  razorpayOrderId: { type: String }, // Stores Razorpay ID: "order_NQS..."
  
  // Failure Specific Fields
  failureReason: { type: String },
  failureCode: { type: String },
  paymentId: { type: String }, 
  
  location: {
    lat: { type: Number },
    lng: { type: Number },
    mapUrl: { type: String },
  },

  restaurantId: { type: String },
  aa: { type: String },
  failedAt: { type: Date, default: Date.now },
});

const PaymentFailedOrder = mongoose.models.PaymentFailedOrder || mongoose.model("PaymentFailedOrder", paymentFailedOrderSchema);
export default PaymentFailedOrder;