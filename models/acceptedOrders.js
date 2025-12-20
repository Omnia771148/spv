import mongoose from "mongoose";

const acceptedOrderSchema = new mongoose.Schema({
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
  restaurantId: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  aa: { type: String, required: true },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
});

const AcceptedOrder =
  mongoose.models.AcceptedOrder ||
  mongoose.model("AcceptedOrder", acceptedOrderSchema);

export default AcceptedOrder;
