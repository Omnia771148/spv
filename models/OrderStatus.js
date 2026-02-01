import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, required: true, default: "Pending" },
  restaurantId: { type: String, required: true },
  items: [
    {
      itemId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  totalCount: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  gst: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus: { type: String, default: "Pending" },

  userName: { type: String }, // ✅ Saved from localStorage
  userEmail: { type: String }, // ✅ Saved from localStorage
  userPhone: { type: String }, // ✅ Saved from localStorage

  location: {
    lat: { type: Number },
    lng: { type: Number },
    mapUrl: { type: String },
    distanceText: { type: String }
  },
  flatNo: { type: String },
  street: { type: String },
  landmark: { type: String },
  deliveryAddress: { type: String }, // Remove required: true
  restaurantName: { type: String },
  aa: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date }
}, { timestamps: true });

// Partial TTL Index: Auto-delete rejected orders 60 seconds after they are last updated.
// This relies on the database's internal timer, so it works even if the Website/App is closed.
// We use 'updatedAt' because that changes when the status changes to Rejected.
orderStatusSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 60,
    partialFilterExpression: {
      status: { $in: ["Rejected", "Rejected by restaurant", "rejected", "rejected by restaurant"] }
    },
    name: "auto_delete_rejected_orders"
  }
);

const OrderStatus = mongoose.models.OrderStatus || mongoose.model("OrderStatus", orderStatusSchema);
export default OrderStatus;