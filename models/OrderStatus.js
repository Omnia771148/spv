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
  location: {
    lat: { type: Number },
    lng: { type: Number },
    mapUrl: { type: String },
    distanceText: { type: String }
  },
  deliveryAddress: { type: String }, // Remove required: true
  aa: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const OrderStatus = mongoose.models.OrderStatus || mongoose.model("OrderStatus", orderStatusSchema);
export default OrderStatus;