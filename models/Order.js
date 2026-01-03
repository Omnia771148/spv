import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
 
  orderId: { type: String, required: true, unique: true },

  razorpayOrderId: { type: String }, 
  razorpayPaymentId: { type: String },
  paymentStatus: { type: String, default: "Pending" },

  // ✅ ADD LOCATION FIELDS HERE
  location: {
    lat: { type: Number },
    lng: { type: Number },
    mapUrl: { type: String }, 
  },

  restaurantId: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  aa: { type: String, required: true }, 
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;