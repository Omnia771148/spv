import mongoose from "mongoose";
import connectionToDatabase from "./mongoose.js";

// Counter schema
const counterSchema = new mongoose.Schema({
  _id: String,        // e.g., "orderId-global"
  seq: { type: Number, default: 0 },
});

// Reuse model if exists
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

export async function generateOrderId() {
  await connectionToDatabase();

  const counterKey = "orderId-global"; // single counter for all orders

  // Atomic increment
  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  // 5-digit sequence (wraps around after 99999)
  const seq = counter.seq.toString().padStart(5, "0");

  return `ORD-${seq}`; // e.g., ORD-00001, ORD-00002, ...
}
